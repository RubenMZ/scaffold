import { useMemo, useState } from "react";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const isAdminRoute = useMemo(
    () => window.location.pathname.startsWith("/admin"),
    []
  );

  const handleImportComplete = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isAdminRoute) {
    return <AdminPage onImportComplete={handleImportComplete} />;
  }

  return <HomePage refreshKey={refreshKey} />;
}

export default App;
