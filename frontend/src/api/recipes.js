const API_BASE_URL = '/api';

export async function fetchUsers() {
  const response = await fetch(`${API_BASE_URL}/users`);

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchRecipes() {
  const response = await fetch(`${API_BASE_URL}/recipes`);

  if (!response.ok) {
    throw new Error(`Failed to fetch recipes: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchRecipesPage({
  page = 1,
  perPage = 20,
  categoryId = '',
  ingredients = [],
} = {}) {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('per_page', perPage);
  if (categoryId) {
    params.set('category_id', categoryId);
  }
  ingredients
    .map((name) => name.toString().trim())
    .filter(Boolean)
    .forEach((name) => params.append('ingredients[]', name));

  const response = await fetch(`${API_BASE_URL}/recipes?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch recipes: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`);

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchIngredientSuggestions(query) {
  const params = new URLSearchParams();
  params.set('query', query);
  const response = await fetch(
    `${API_BASE_URL}/ingredients?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch ingredients: ${response.statusText}`);
  }

  return response.json();
}

export async function importRecipes(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/recipes/import`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to import recipes');
  }

  return data;
}
