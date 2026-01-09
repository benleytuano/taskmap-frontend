import { createBrowserRouter } from "react-router";

// Pages
import LoginPage from "@/pages/Login/LoginPage";
import Dashboard from "@/pages/Dashboard/Dashboard";
import TaskDetails from "@/pages/TaskDetails/TaskDetails";
import RootLayout from "@/layouts/RootLayout";

// Loaders
import rootLayoutLoader from "./loaders/rootLayout";
import dashboardLoader from "./loaders/dashboard";
import taskDetailsLoader from "./loaders/taskDetails";

// Actions
import { loginAction } from "./actions/login";
import { createTaskAction } from "./actions/createTask";

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
        action: createTaskAction,
      },
      {
        path: "tasks/:taskId",
        Component: TaskDetails,
        loader: taskDetailsLoader,
      },
      // Add more dashboard child routes here:
      // { path: "settings", Component: Settings },
      // { path: "profile", Component: Profile },
    ],
  },
  // Add more routes here as needed:
  // { path: "/register", Component: RegisterPage },
]);
