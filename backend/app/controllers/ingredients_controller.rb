class IngredientsController < ApplicationController
  def index
    query = params[:query].to_s.strip
    return render json: [] if query.blank?

    ingredients = Ingredient.where("name ILIKE ?", "#{query}%")
                            .distinct
                            .order(:name)
                            .limit(12)
                            .pluck(:name)

    render json: ingredients
  end
end
