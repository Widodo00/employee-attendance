import { createBrowserRouter } from "react-router";
import Login from "./pages/login/page";
import Dashboard from "./pages/dashboard/page";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/dashboard", element: <Dashboard /> },
]);
