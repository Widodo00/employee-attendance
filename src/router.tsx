import { createBrowserRouter } from "react-router";
import Login from "./login/page";

export const router = createBrowserRouter([
  { path: '/login', element: <Login/> },
]);
