import { createBrowserRouter } from "react-router";
import LoginPage from "@/pages/Login/LoginPage";
import { loginAction } from "@/pages/Login/Actions/loginAction";
import Dashboard from "@/pages/Dashboard/Dashboard";
import dashboardLoader from "@/pages/Dashboard/Loader/dashboardLoader";
import RootLayout from "@/layouts/RootLayout";
import rootLayoutLoader from "@/layouts/Loader/rootLayoutLoader";

export const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    Component: LoginPage,
    action: loginAction,
  },
  // Protected routes with RootLayout
  {
    path: "/dashboard",
    Component: RootLayout,
    loader: rootLayoutLoader,
    children: [
      {
        index: true,
        Component: Dashboard,
        loader: dashboardLoader,
      },
      // Add more dashboard child routes here:
      // { path: "settings", Component: Settings },
      // { path: "profile", Component: Profile },
    ],
  },
  // Add more routes here as needed:
  // { path: "/register", Component: RegisterPage },
]);
