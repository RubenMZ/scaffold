import { useState, useEffect } from "react";
import { fetchRecipesPage } from "../api/recipes";

function RecipesList({
  page,
  perPage,
  categoryId,
  ingredients,
  onPageChange,
  refreshKey
}) {
  const [recipes, setRecipes] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    per_page: perPage,
    total_count: 0,
    total_pages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecipes();
  }, [page, perPage, categoryId, ingredients, refreshKey]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await fetchRecipesPage({
        page,
        perPage,
        categoryId,
        ingredients
      });
      setRecipes(data.recipes || []);
      setMeta(data.meta || meta);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <p className="text-gray-500">Loading recipes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading recipes</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const formatIngredientLine = (recipeIngredient) => {
    const amount = recipeIngredient.amount;
    const unit = recipeIngredient.ingredient?.unit;
    const name = recipeIngredient.ingredient?.name;

    if (!name) return null;

    const parts = [];
    if (amount !== null && amount !== undefined && amount !== "") {
      parts.push(amount);
    }
    if (unit) {
      parts.push(unit);
    }
    parts.push(name);

    return parts.join(" ");
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Recipes ({meta.total_count || recipes.length})
      </h2>

      {recipes.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-6 text-center text-gray-500">
          No recipes found. Import some recipes to get started.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {recipe.image && (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>

                  {recipe.category && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded mb-2">
                      {recipe.category.name}
                    </span>
                  )}

                  <div className="flex items-center text-sm text-gray-600 space-x-4 mb-2">
                    {recipe.prep_time > 0 && (
                      <span>🔪 {recipe.prep_time} min</span>
                    )}
                    {recipe.cook_time > 0 && (
                      <span>🔥 {recipe.cook_time} min</span>
                    )}
                  </div>

                  {recipe.user && (
                    <p className="text-sm text-gray-500">
                      by{" "}
                      <span className="font-medium text-gray-700">
                        {recipe.user.nickname || `${recipe.user.first_name} ${recipe.user.last_name}`}
                      </span>
                    </p>
                  )}

                  {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Ingredients
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-gray-600">
                        {recipe.recipe_ingredients.map((recipeIngredient) => {
                          const line = formatIngredientLine(recipeIngredient);
                          if (!line) return null;
                          return <li key={recipeIngredient.id}>{line}</li>;
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Page {meta.page} of {meta.total_pages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(1, meta.page - 1))}
                disabled={meta.page <= 1}
                className="px-3 py-2 text-sm font-medium rounded-md border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => onPageChange(Math.min(meta.total_pages, meta.page + 1))}
                disabled={meta.page >= meta.total_pages}
                className="px-3 py-2 text-sm font-medium rounded-md border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default RecipesList;
