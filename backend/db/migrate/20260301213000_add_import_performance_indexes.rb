class AddImportPerformanceIndexes < ActiveRecord::Migration[8.1]
  def change
    add_index :ingredients, [:name, :unit], unique: true
    add_index :ingredients, :name
    add_index :recipe_ingredients, [:recipe_id, :ingredient_id], unique: true
  end
end
