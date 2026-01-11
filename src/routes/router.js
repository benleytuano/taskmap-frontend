import { createBrowserRouter } from "react-router";

// Pages
import LoginPage from "@/pages/Login/LoginPage";
import Dashboard from "@/pages/Dashboard/Dashboard";
import TaskDetails from "@/pages/TaskDetails/TaskDetails";
import MyTasks from "@/pages/MyTasks/MyTasks";
import UserTaskDetails from "@/pages/MyTasks/UserTaskDetails";
import RootLayout from "@/layouts/RootLayout";

// Loaders
import rootLayoutLoader from "./loaders/rootLayout";
import dashboardLoader from "./loaders/dashboard";
import taskDetailsLoader from "./loaders/taskDetails";
import myTasksLoader from "./loaders/myTasks";
import userTaskDetailsLoader from "./loaders/userTaskDetails";

// Actions
import { loginAction } from "./actions/login";
import { createTaskAction } from "./actions/createTask";
import { taskDetailsAction } from "./actions/taskDetails";
import { userTaskDetailsAction } from "./actions/userTaskDetails";

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
        path: "my-tasks",
        Component: MyTasks,
        loader: myTasksLoader,
      },
      {
        path: "my-tasks/:assignmentId",
        Component: UserTaskDetails,
        loader: userTaskDetailsLoader,
        action: userTaskDetailsAction,
      },
      {
        path: "tasks/:taskId",
        Component: TaskDetails,
        loader: taskDetailsLoader,
        action: taskDetailsAction,
      },
      // Add more dashboard child routes here:
      // { path: "settings", Component: Settings },
      // { path: "profile", Component: Profile },
    ],
  },
  // Add more routes here as needed:
  // { path: "/register", Component: RegisterPage },
]);
