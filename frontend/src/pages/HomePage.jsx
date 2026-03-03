import { useEffect, useMemo, useState } from "react";
import { fetchCategories } from "../api/recipes";
import RecipesList from "../components/RecipesList";

const INGREDIENT_HISTORY_KEY = "ingredientHistory";

function HomePage({ refreshKey }) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(null);
  const [ingredientQuery, setIngredientQuery] = useState("");
  const [ingredientChips, setIngredientChips] = useState([]);
  const [ingredientHistory, setIngredientHistory] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
        setCategoriesError(null);
      } catch (err) {
        setCategoriesError(err.message);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [perPage, categoryId, ingredientChips]);

  useEffect(() => {
    const stored = localStorage.getItem(INGREDIENT_HISTORY_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setIngredientHistory(parsed);
      }
    } catch (err) {
      localStorage.removeItem(INGREDIENT_HISTORY_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      INGREDIENT_HISTORY_KEY,
      JSON.stringify(ingredientHistory)
    );
  }, [ingredientHistory]);

  const addIngredientChip = (value) => {
    const next = value.toString().trim();
    if (!next) return;
    const exists = ingredientChips.some(
      (chip) => chip.toLowerCase() === next.toLowerCase()
    );
    if (exists) {
      setIngredientQuery("");
      setSuggestionsOpen(false);
      return;
    }
    setIngredientChips((prev) => [...prev, next]);
    setIngredientHistory((prev) => {
      const exists = prev.some(
        (item) => item.toLowerCase() === next.toLowerCase()
      );
      if (exists) return prev;
      return [next, ...prev].slice(0, 20);
    });
    setIngredientQuery("");
    setSuggestionsOpen(false);
  };

  const removeIngredientChip = (value) => {
    setIngredientChips((prev) => prev.filter((chip) => chip !== value));
  };

  const handleIngredientKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addIngredientChip(ingredientQuery);
    }
    if (event.key === "Escape") {
      setSuggestionsOpen(false);
    }
  };

  const clearFilters = () => {
    setCategoryId("");
    setIngredientChips([]);
    setIngredientQuery("");
    setSuggestionsOpen(false);
  };

  const filteredSuggestions = useMemo(() => {
    const query = ingredientQuery.trim().toLowerCase();
    if (!query) return [];
    return ingredientHistory
      .filter((item) => item.toLowerCase().includes(query))
      .filter(
        (item) =>
          !ingredientChips.some(
            (chip) => chip.toLowerCase() === item.toLowerCase()
          )
      )
      .slice(0, 8);
  }, [ingredientHistory, ingredientQuery, ingredientChips]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 py-10 px-4 sm:px-6 lg:px-8">
      <header className="w-full max-w-6xl mx-auto mb-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-600 font-semibold">
                Pantry flow
              </p>
              <h1 className="text-4xl font-bold text-gray-900 font-serif">
                Recipes
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Search by what you have, then see the best matches first.
              </p>
            </div>
            <a
              href="/admin"
              className="text-sm font-medium text-amber-700 hover:text-amber-800"
            >
              Admin import
            </a>
          </div>

          <div className="bg-white/90 backdrop-blur shadow-sm rounded-2xl border border-amber-100">
            <div className="flex flex-col gap-4 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="ingredient-search"
                    className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2"
                  >
                    Ingredients you have
                  </label>
                  <div className="relative">
                    <div className="flex flex-wrap gap-2 items-center rounded-xl border border-gray-200 bg-white px-3 py-2 min-h-[52px]">
                      {ingredientChips.map((chip) => (
                        <span
                          key={chip}
                          className="flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full"
                        >
                          {chip}
                          <button
                            type="button"
                            onClick={() => removeIngredientChip(chip)}
                            className="text-amber-700 hover:text-amber-900"
                          >
                            x
                          </button>
                        </span>
                      ))}
                      <input
                        id="ingredient-search"
                        type="text"
                        value={ingredientQuery}
                        onChange={(e) => setIngredientQuery(e.target.value)}
                        onKeyDown={handleIngredientKeyDown}
                        onFocus={() =>
                          filteredSuggestions.length && setSuggestionsOpen(true)
                        }
                        placeholder="Type an ingredient and press Enter"
                        className="flex-1 min-w-[160px] text-sm text-gray-700 outline-none bg-transparent"
                      />
                    </div>

                    {suggestionsOpen && filteredSuggestions.length > 0 && (
                      <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                        {filteredSuggestions.map((name) => (
                          <button
                            type="button"
                            key={name}
                            onClick={() => addIngredientChip(name)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50"
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full lg:w-60">
                  <label
                    htmlFor="category-filter"
                    className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2"
                  >
                    Category
                  </label>
                  <select
                    id="category-filter"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  >
                    <option value="">All categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {categoriesError && (
                    <p className="text-xs text-red-600 mt-2">
                      {categoriesError}
                    </p>
                  )}
                </div>

                <div className="w-full lg:w-40">
                  <label
                    htmlFor="per-page"
                    className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2"
                  >
                    Per page
                  </label>
                  <select
                    id="per-page"
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  Sorts by closest ingredient match, then total time.
                </span>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-amber-700 font-semibold hover:text-amber-800"
                >
                  Clear filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mb-12">
        <RecipesList
          page={page}
          perPage={perPage}
          categoryId={categoryId}
          ingredients={ingredientChips}
          onPageChange={setPage}
          refreshKey={refreshKey}
        />
      </div>
    </div>
  );
}

export default HomePage;
