class RecipesController < ApplicationController
  def index
    page = params[:page].to_i
    page = 1 if page < 1

    per_page = params[:per_page].to_i
    allowed_per_page = [20, 50, 100]
    per_page = allowed_per_page.include?(per_page) ? per_page : 20

    ingredient_names = normalize_ingredient_names(params[:ingredients])

    base_scope = Recipe.all
    base_scope = base_scope.where(category_id: params[:category_id]) if params[:category_id].present?

    if ingredient_names.any?
      term_expressions = ingredient_names.map do |term|
        ActiveRecord::Base.sanitize_sql_array([
          "MAX(CASE WHEN LOWER(ingredients.name) LIKE ? THEN 1 ELSE 0 END)",
          "%#{term}%"
        ])
      end
      matched_terms_sql = term_expressions.join(" + ")

      base_scope = base_scope.joins(recipe_ingredients: :ingredient)
                             .group("recipes.id")
                             .select("recipes.*, #{matched_terms_sql} AS matched_terms_count")
                             .having("#{matched_terms_sql} >= #{ingredient_names.size}")
    end

    count_scope = base_scope.except(:select, :order)
    total_count = if ingredient_names.any?
                    count_scope.count.length
                  else
                    count_scope.count
                  end
    total_pages = [(total_count.to_f / per_page).ceil, 1].max

    recipes_scope = base_scope
    if ingredient_names.any?
      ingredient_count_sql = "COUNT(DISTINCT recipe_ingredients.ingredient_id)"
      recipes_scope = recipes_scope.select("recipes.*, #{ingredient_count_sql} AS ingredient_count")
                                   .order(Arel.sql("ingredient_count ASC, (COALESCE(recipes.prep_time, 0) + COALESCE(recipes.cook_time, 0)) ASC"))
    else
      ingredient_count_sql = "COUNT(DISTINCT recipe_ingredients.ingredient_id)"
      recipes_scope = recipes_scope.left_joins(:recipe_ingredients)
                                   .group("recipes.id")
                                   .select("recipes.*, #{ingredient_count_sql} AS ingredient_count")
                                   .order(Arel.sql("ingredient_count ASC, (COALESCE(recipes.prep_time, 0) + COALESCE(recipes.cook_time, 0)) ASC"))
    end

    recipes = recipes_scope.preload(:category, :user, recipe_ingredients: :ingredient)
                           .limit(per_page)
                           .offset((page - 1) * per_page)

    render json: {
      recipes: recipes.as_json(include: [
        :category,
        :user,
        { recipe_ingredients: { include: :ingredient } }
      ]),
      meta: {
        page: page,
        per_page: per_page,
        total_count: total_count,
        total_pages: total_pages
      }
    }
  end

  private

  def normalize_ingredient_names(value)
    names = Array(value).map { |name| name.to_s.strip.downcase }.reject(&:blank?)
    names.uniq
  end

  def import
    unless params[:file].present?
      return render json: { error: "No file provided" }, status: :unprocessable_entity
    end

    file = params[:file]

    unless file.content_type == "application/json"
      return render json: { error: "File must be JSON" }, status: :unprocessable_entity
    end

    json_data = file.read
    importer = RecipeImporter.new(json_data)
    stats = importer.import!

    render json: {
      message: "Import completed",
      stats: stats
    }, status: :ok
  rescue JSON::ParserError => e
    render json: { error: "Invalid JSON file: #{e.message}" }, status: :unprocessable_entity
  rescue StandardError => e
    render json: { error: "Import failed: #{e.message}" }, status: :internal_server_error
  end
end
