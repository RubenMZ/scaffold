require "cgi"

class RecipeImporter
  BATCH_SIZE = 1000
  INSERT_BATCH_SIZE = 1000

  def initialize(json_data)
    @data = JSON.parse(json_data)
    @stats = { created: 0, skipped: 0, errors: [] }
    @categories_map = {}
    @users_map = {}
    @ingredients_map = {}
  end

  def import!
    # Step 0: Replace full dataset
    reset_tables!

    # Step 1 + 2: Small catalog tables
    ActiveRecord::Base.transaction do
      import_users
      import_categories
    end

    # Step 3: Import recipes in batches
    @data.each_slice(BATCH_SIZE).with_index do |batch, batch_index|
      ActiveRecord::Base.transaction do
        import_batch(batch, batch_index * BATCH_SIZE)
      end
    end
    @stats
  end

  private

  # Helper method to insert records in batches
  def batch_insert_all(model, records)
    records.each_slice(INSERT_BATCH_SIZE) do |batch|
      model.insert_all(batch) if batch.any?
    end
  end

  # Helper method to insert records in batches and return selected columns
  def batch_insert_all_returning(model, records, returning:)
    rows = []
    records.each_slice(INSERT_BATCH_SIZE) do |batch|
      next if batch.empty?

      result = model.insert_all(batch, returning: returning)
      rows.concat(result.rows)
    end
    rows
  end

  def reset_tables!
    ActiveRecord::Base.transaction do
      # Delete children first to respect FK constraints
      RecipeIngredient.delete_all
      Recipe.delete_all
      Ingredient.delete_all
      Category.delete_all
      User.delete_all
    end
  ensure
    @users_map = {}
    @categories_map = {}
    @ingredients_map = {}
  end

  def import_users
    # Extract all unique authors (excluding deleteduser)
    unique_authors = @data.map { |r| r["author"] }
                          .compact
                          .reject { |a| a.blank? || a == "deleteduser" }
                          .uniq

    return if unique_authors.empty?

    timestamp = Time.current
    user_records = unique_authors.map do |nickname|
      {
        nickname: nickname,
        first_name: nickname,
        last_name: "",
        email: "#{nickname}@imported.com",
        created_at: timestamp,
        updated_at: timestamp
      }
    end

    inserted_rows = batch_insert_all_returning(User, user_records, returning: [:nickname, :id])
    @users_map = inserted_rows.to_h
  end

  def import_categories
    # Extract all unique categories
    unique_categories = @data.map { |r| r["category"] }
                             .compact
                             .map(&:strip)
                             .reject(&:blank?)
                             .uniq

    return if unique_categories.empty?

    timestamp = Time.current
    category_records = unique_categories.map do |name|
      {
        name: name,
        created_at: timestamp,
        updated_at: timestamp
      }
    end

    inserted_rows = batch_insert_all_returning(Category, category_records, returning: [:name, :id])
    @categories_map = inserted_rows.to_h
  end

  def import_batch(batch, offset)
    # Validate and prepare recipe data
    valid_recipes = []
    batch.each_with_index do |recipe_data, index|
      validated = validate_recipe(recipe_data, offset + index)
      valid_recipes << validated if validated
    end

    return if valid_recipes.empty?

    # Bulk insert recipes
    recipe_ids = bulk_insert_recipes(valid_recipes)

    # Bulk insert ingredients and recipe_ingredients
    bulk_insert_ingredients(valid_recipes, recipe_ids)

    @stats[:created] += valid_recipes.size
  end

  def validate_recipe(recipe_data, index)
    # Validate required fields
    unless recipe_data["title"].present?
      @stats[:errors] << { index: index, error: "Missing title" }
      @stats[:skipped] += 1
      return nil
    end

    unless recipe_data["category"].present?
      @stats[:errors] << { index: index, title: recipe_data["title"], error: "Missing category" }
      @stats[:skipped] += 1
      return nil
    end

    recipe_data
  rescue StandardError => e
    @stats[:errors] << { index: index, title: recipe_data["title"], error: e.message }
    @stats[:skipped] += 1
    nil
  end

  def bulk_insert_recipes(valid_recipes)
    timestamp = Time.current

    recipe_records = valid_recipes.map do |recipe_data|
      category_id = @categories_map[recipe_data["category"].strip]
      user_id = @users_map[recipe_data["author"]] if recipe_data["author"] != "deleteduser"
      image_url = parse_image_url(recipe_data["image"])

      {
        title: recipe_data["title"],
        cook_time: recipe_data["cook_time"],
        prep_time: recipe_data["prep_time"],
        image: image_url,
        category_id: category_id,
        user_id: user_id,
        created_at: timestamp,
        updated_at: timestamp
      }
    end

    # Insert in batches and collect all IDs
    all_ids = []
    recipe_records.each_slice(INSERT_BATCH_SIZE) do |batch|
      result = Recipe.insert_all(batch, returning: [:id])
      all_ids.concat(result.rows.flatten)
    end
    all_ids
  end

  def parse_image_url(value)
    return nil if value.blank?

    url = value.to_s.strip
    url = url.gsub(/\s+/, "")
    return nil if url.empty?

    if url.include?("imagesvc.meredithcorp.io") && url.include?("url=")
      encoded = url.split("url=", 2).last
      decoded = CGI.unescape(encoded)
      url = decoded if decoded.present?
    end

    if url.start_with?("//")
      url = "https:#{url}"
    end

    url = "https://#{url}" unless url.start_with?("http://", "https://")
    url
  end

  def bulk_insert_ingredients(valid_recipes, recipe_ids)
    # Parse ingredients once per recipe and keep them for relation inserts
    parsed_ingredients_by_recipe = valid_recipes.map do |recipe_data|
      (recipe_data["ingredients"] || []).filter_map do |ingredient_text|
        parsed = parse_ingredient(ingredient_text)
        parsed if parsed[:name].present?
      end
    end

    all_ingredients = parsed_ingredients_by_recipe.flatten
    return if all_ingredients.empty?

    # Get unique ingredient combinations (name + unit)
    unique_ingredients = all_ingredients.uniq { |i| [i[:name], i[:unit]] }

    # Bulk insert ingredients
    timestamp = Time.current
    new_ingredients = unique_ingredients.reject do |ing|
      @ingredients_map.key?([ing[:name], ing[:unit]])
    end

    ingredient_records = new_ingredients.map do |ing|
      {
        name: ing[:name],
        unit: ing[:unit],
        created_at: timestamp,
        updated_at: timestamp
      }
    end

    if ingredient_records.any?
      inserted_rows = batch_insert_all_returning(Ingredient, ingredient_records, returning: [:name, :unit, :id])
      inserted_rows.each { |name, unit, id| @ingredients_map[[name, unit]] = id }
    end

    # Build recipe_ingredients associations
    recipe_ingredient_records = []
    parsed_ingredients_by_recipe.each_with_index do |parsed_ingredients, index|
      recipe_id = recipe_ids[index]
      parsed_ingredients.each do |parsed|
        ingredient_id = @ingredients_map[[parsed[:name], parsed[:unit]]]
        next unless ingredient_id

        recipe_ingredient_records << {
          recipe_id: recipe_id,
          ingredient_id: ingredient_id,
          amount: parsed[:amount],
          created_at: timestamp,
          updated_at: timestamp
        }
      end
    end

    batch_insert_all(RecipeIngredient, recipe_ingredient_records) if recipe_ingredient_records.any?
  end

  def parse_ingredient(text)
    # Parse "1 cup chopped walnuts" -> { amount: 1, unit: "cup", name: "chopped walnuts" }
    # Parse "⅔ cup white sugar" -> { amount: 0.66, unit: "cup", name: "white sugar" }
    # Parse "salt" -> { amount: nil, unit: nil, name: "salt" }

    text = text.strip
    parts = text.split(" ", 3)

    amount = parse_amount(parts[0])
    if amount
      # Has numeric amount
      unit = parts[1]
      name = parts[2..-1].join(" ")
    else
      # No amount, just ingredient name
      amount = nil
      unit = nil
      name = text
    end

    { amount: amount, unit: unit, name: name }
  end

  def parse_amount(str)
    return nil if str.blank?

    # Convert fractions to decimals
    fractions = {
      "⅛" => 0.125, "¼" => 0.25, "⅓" => 0.333, "⅜" => 0.375,
      "½" => 0.5, "⅝" => 0.625, "⅔" => 0.667, "¾" => 0.75, "⅞" => 0.875
    }

    fractions.each do |symbol, value|
      str = str.gsub(symbol, value.to_s)
    end

    # Try to convert to float
    Float(str)
  rescue ArgumentError
    nil
  end
end
