class RecipeIngredient < ApplicationRecord
  belongs_to :recipe
  belongs_to :ingredient

  validates :amount, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
end
