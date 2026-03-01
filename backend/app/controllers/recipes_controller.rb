class RecipesController < ApplicationController
  def index
    recipes = Recipe.includes(:category, :user, :ingredients).order(created_at: :desc).limit(100)
    render json: recipes, include: [:category, :user, :ingredients]
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
