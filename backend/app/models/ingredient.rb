class Ingredient < ApplicationRecord
  has_many :recipe_ingredients, dependent: :delete_all
  has_many :recipes, through: :recipe_ingredients

  validates :name, presence: true
end
