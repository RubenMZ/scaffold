import { useEffect, useState } from "react";
import RecipeImporter from "../components/RecipeImporter";

const ADMIN_STORAGE_KEY = "adminAuthed";

function AdminPage({ onImportComplete }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(ADMIN_STORAGE_KEY);
    if (stored === "true") {
      setAuthed(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const expected = import.meta.env.VITE_ADMIN_PASSWORD || "admin";
    if (password === expected) {
      setAuthed(true);
      setError(null);
      sessionStorage.setItem(ADMIN_STORAGE_KEY, "true");
      setPassword("");
      return;
    }
    setError("Incorrect password");
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    setAuthed(false);
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
            <p className="text-sm text-gray-600 mt-1">
              Import recipes and manage data access.
            </p>
          </div>
          {authed && (
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium rounded-md border border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
            >
              Log out
            </button>
          )}
        </div>

        {!authed ? (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Admin password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Uses VITE_ADMIN_PASSWORD or defaults to "admin".
                </p>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium text-sm"
                >
                  Enter admin
                </button>
              </div>
            </form>
          </div>
        ) : (
          <RecipeImporter onImportComplete={onImportComplete} />
        )}
      </div>
    </div>
  );
}

export default AdminPage;
