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
