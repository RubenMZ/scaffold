import { useState } from "react";
import { importRecipes } from "../api/recipes";

function RecipeImporter({ onImportComplete }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/json") {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setFile(null);
      setError("Please select a valid JSON file");
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const data = await importRecipes(file);
      setResult(data);
      setFile(null);
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Import Recipes</h2>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select JSON file
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              disabled={importing}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
            />
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span className="text-sm text-gray-700">{file.name}</span>
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                {importing ? "Importing..." : "Import"}
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <p className="font-medium">{result.message}</p>
              <div className="text-sm mt-2 space-y-1">
                <p>✓ Created: {result.stats.created} recipes</p>
                {result.stats.skipped > 0 && (
                  <p>⚠ Skipped: {result.stats.skipped} recipes</p>
                )}
                {result.stats.errors?.length > 0 && (
                  <p>✗ Errors: {result.stats.errors.length}</p>
                )}
              </div>
              {result.stats.errors?.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    View errors
                  </summary>
                  <div className="mt-2 max-h-48 overflow-y-auto text-xs">
                    {result.stats.errors.map((err, idx) => (
                      <div key={idx} className="py-1 border-t border-green-100">
                        <span className="font-mono">#{err.index}</span>
                        {err.title && (
                          <span className="ml-2">{err.title}</span>
                        )}
                        {err.error && (
                          <span className="ml-2 text-red-600">
                            - {err.error}
                          </span>
                        )}
                        {err.reason && (
                          <span className="ml-2 text-yellow-600">
                            - {err.reason}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipeImporter;
