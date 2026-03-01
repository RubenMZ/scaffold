import { useState, useEffect } from "react";
import { fetchRecipes } from "../api/recipes";

function RecipesList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await fetchRecipes();
      setRecipes(data);
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

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Recipes ({recipes.length})
      </h2>

      {recipes.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-6 text-center text-gray-500">
          No recipes found. Import some recipes to get started.
        </div>
      ) : (
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

                {recipe.ingredients && recipe.ingredients.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecipesList;
