import { useState } from "react";
import UsersList from "./components/UsersList";
import RecipeImporter from "./components/RecipeImporter";
import RecipesList from "./components/RecipesList";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleImportComplete = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <RecipeImporter onImportComplete={handleImportComplete} />
      <div className="mb-12">
        <RecipesList key={refreshKey} />
      </div>
      <UsersList />
    </div>
  );
}

export default App;
