import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PreferencesProvider } from "../context/PreferencesContext";
import { ROUTES } from "./routes";

const router = createBrowserRouter(ROUTES);

export function App() {
  return (
    <PreferencesProvider>
      <RouterProvider router={router} />
    </PreferencesProvider>
  );
}
