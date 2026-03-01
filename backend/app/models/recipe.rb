class Recipe < ApplicationRecord
  belongs_to :category
  belongs_to :user, optional: true

  has_many :recipe_ingredients, dependent: :delete_all
  has_many :ingredients, through: :recipe_ingredients

  validates :title, presence: true
end
