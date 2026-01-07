import { createBrowserRouter } from "react-router";
import LoginPage from "@/pages/Login/LoginPage";
import { loginAction } from "@/pages/Login/Actions/loginAction";
import Dashboard from "@/pages/Dashboard/Dashboard";
import dashboardLoader from "@/pages/Dashboard/Loader/dashboardLoader";

export const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    Component: LoginPage,
    action: loginAction,
  },
  // Protected routes
  {
    path: "/dashboard",
    Component: Dashboard,
    loader: dashboardLoader,
  },
  // Add more routes here as needed:
  // { path: "/register", Component: RegisterPage },
]);
