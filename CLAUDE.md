# Project Context

## Tech Stack

- **Framework**: React
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **HTTP Client**: Axios

## API Service

### Configuration

All API calls use a centralized axios instance located at `src/services/api.js`:

```javascript
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Send HttpOnly cookies with requests
});

export default axiosInstance;
```

### Authentication Strategy

This project uses **HttpOnly cookies** for JWT storage:

- **Security**: Cookies cannot be accessed via JavaScript, preventing XSS attacks
- **Automatic**: Browser automatically sends cookies with each request
- **No Manual Token Handling**: No need to manually add Authorization headers

### Features

- **Base URL**: Configured via `VITE_API_URL` environment variable
- **HttpOnly Cookie Support**: `withCredentials: true` ensures cookies are sent with cross-origin requests
- **CSRF Protection**: Backend should implement CSRF tokens for state-changing operations

### Usage

Import the axios instance in loaders, actions, or components:

```javascript
import axiosInstance from "@/services/api";

// In loaders
const response = await axiosInstance.get("/events");

// In actions
const response = await axiosInstance.post("/events", data);

// In components
const response = await axiosInstance.put(`/events/${id}`, data);
```

### Environment Variables

The `.env` file is configured with:

```
VITE_API_URL=http://localhost:8000/api/v1
```

## Code Style Guidelines

- Use shadcn/ui components for all UI elements
- Follow Tailwind utility-first approach for styling
- Use React Router for all navigation and routing needs
- Use mobile-first design approach (design for small screens, then scale up to large screens)

## Git Commit Convention

Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification:

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat:` - New feature (maps to MINOR version)
- `fix:` - Bug fix (maps to PATCH version)
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring (no feature or bug fix)
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks, tooling, dependencies
- `BREAKING CHANGE:` - Breaking API changes (maps to MAJOR version)

### Examples

```
feat(auth): add login functionality
fix(button): resolve click event handler
docs: update README with setup instructions
chore: update dependencies
```

### Breaking Changes

Indicate with `!` or `BREAKING CHANGE:` footer:

```
feat!: remove deprecated API endpoint
feat(api): change response format

BREAKING CHANGE: API now returns data in v2 format
```

## Router Configuration

### Entry Point

The router is initialized in `src/main.tsx`:

```tsx
import { RouterProvider } from "react-router";
import { router } from "./routes/router";

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
```

### Route Definitions

All routes are defined in `src/routes/router.js` using `createBrowserRouter`.

**File Structure:**
```
src/routes/
├── router.js          # Main router configuration
├── loaders/          # Route loaders (one file per page)
│   ├── rootLayout.js
│   ├── dashboard.js
│   └── ...
└── actions/          # Route actions (one file per page)
    ├── login.js
    ├── dashboard.js
    └── ...
```

**Router Example:**
```jsx
import { createBrowserRouter } from "react-router";

// Pages
import LoginPage from "@/pages/Login/LoginPage";
import Dashboard from "@/pages/Dashboard/Dashboard";
import RootLayout from "@/layouts/RootLayout";

// Loaders
import rootLayoutLoader from "./loaders/rootLayout";
import dashboardLoader from "./loaders/dashboard";

// Actions
import { loginAction } from "./actions/login";

export const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    Component: LoginPage,
    action: loginAction
  },

  // Protected dashboard routes (nested)
  {
    id: "root",
    path: "/dashboard",
    Component: RootLayout,
    loader: rootLayoutLoader,
    children: [
      {
        index: true,
        Component: Dashboard,
        loader: dashboardLoader
      },
      // Add more child routes here
    ]
  }
]);
```

**Key Principles:**
- All loaders go in `src/routes/loaders/` (one file per page)
- All actions go in `src/routes/actions/` (one file per page)
- Keep page components in `src/pages/`
- Import loaders and actions into `router.js` with clear organization

## Route Structure

### Public Routes

- `/` - Login page with form submission action
- `/register` - Registration page
- `/attendance/scan` - QR code check-in page

### Protected Routes (Dashboard)

All dashboard routes are nested under `/dashboard` with a shared layout:

- `/dashboard` - Dashboard home (index route with task list)
- `/dashboard/task` - Task management page
- `/dashboard/tasks/:taskId` - Task details page
- `/dashboard/tasks/:taskId/delete` - Delete task action route
- `/dashboard/settings` - Settings page

## Key Patterns

### 1. Nested Routes with Shared Layout

The dashboard uses a parent-child route structure:

```tsx
{
  id: "root",
  path: "/dashboard",
  Component: RootLayout,
  loader: rootLayoutLoader,  // Auth check
  children: [
    { index: true, Component: Dashboard, loader: dashboardLoader },
    { path: "all-events", Component: AllEvents, loader: allEventsLoader },
    // ...
  ]
}
```

The `RootLayout` component renders:

- Sidebar navigation
- Top bar with user profile
- `<Outlet />` for child route content

### 2. Route Loaders for Data Fetching

Loaders fetch data before rendering components. All loaders are located in `src/routes/loaders/` with one file per page.

**Loader Pattern:**
```javascript
// src/routes/loaders/dashboard.js
import axiosInstance from "@/services/api";
import { redirect } from "react-router";

export default async function dashboardLoader() {
  try {
    // HttpOnly cookie is automatically sent with request
    const response = await axiosInstance.get("/tasks");
    return { tasks: response.data?.data?.tasks || [] };
  } catch (error) {
    // Handle errors
    if (error.response?.status === 401) {
      return redirect("/"); // Redirect if unauthorized
    }
    return { tasks: [] };
  }
}
```

**Note:** Auth verification happens at the layout level. Individual loaders just fetch data.

**Loader Files:**
- `src/routes/loaders/rootLayout.js` - Auth verification for all dashboard routes
- `src/routes/loaders/dashboard.js` - Fetch tasks for dashboard
- `src/routes/loaders/taskDetails.js` - Fetch single task details
- One file per page that needs to load data

**References:**
- [React Router Loader Documentation](https://reactrouter.com/start/data/route-object#loader)
- [Data Loading Guide](https://reactrouter.com/start/data/data-loading)

### 3. Route Actions for Form Handling

Actions handle form submissions and mutations. All actions are located in `src/routes/actions/` with one file per page.

**Action Pattern:**
```javascript
// src/routes/actions/login.js
import axiosInstance from "@/services/api";
import { redirect } from "react-router";

export async function loginAction({ request }) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });
    return redirect("/dashboard");
  } catch (error) {
    if (error.response?.status === 401) {
      return { error: "Invalid email or password" };
    }
    return { error: "An error occurred. Please try again." };
  }
}
```

**Action Files:**
- `src/routes/actions/login.js` - Handle login
- `src/routes/actions/createTask.js` - Create new task
- `src/routes/actions/updateTask.js` - Update task
- `src/routes/actions/deleteTask.js` - Delete task
- One file per page that handles form submissions

**References:**
- [React Router Actions Documentation](https://reactrouter.com/start/data/actions)

### 4. Action-Only Routes

Some routes exist only to handle actions without rendering a component:

```javascript
import { deleteTaskAction } from "./actions/deleteTask";

// In router.js
{
  path: "tasks/:taskId/delete",
  action: deleteTaskAction
}
```

These routes handle POST/DELETE operations and typically redirect after completion.

### 5. Navigation Hooks

The app uses React Router hooks for navigation:

```tsx
const navigate = useNavigate();
const location = useLocation();

// Programmatic navigation
navigate("/dashboard");

// Check active route
const isActive = (path: string) => location.pathname === path;
```

### 6. Route Parameters

Dynamic segments are used for task-specific routes:

```javascript
{ path: "tasks/:taskId", Component: TaskDetails }
```

Parameters are accessed in loaders/actions via `params`:

```javascript
// src/routes/loaders/taskDetails.js
export default async function taskDetailsLoader({ params }) {
  const taskId = params.taskId;
  const response = await axiosInstance.get(`/tasks/${taskId}`);
  return response.data.data.task;
}
```

## Authentication Pattern

### Route Protection

Authentication is enforced at the layout level via `rootLayoutLoader` located at `src/routes/loaders/rootLayout.js`:

```javascript
// src/routes/loaders/rootLayout.js
import { redirect } from "react-router";
import axiosInstance from "@/services/api";

export default async function rootLayoutLoader() {
  try {
    // Verify authentication by calling a protected endpoint
    // The HttpOnly cookie is automatically sent with the request
    const response = await axiosInstance.get("/auth/me");
    return response.data.data.user; // Return user data if authenticated
  } catch (error) {
    // If verification fails, redirect to login
    if (error.response?.status === 401) {
      return redirect("/");
    }
    throw error;
  }
}
```

This loader runs before any child route, protecting the entire `/dashboard` section.

**Key Points:**

- No manual token handling - cookies are sent automatically
- Backend validates the HttpOnly cookie
- Failed authentication returns 401, triggering redirect

### Logout Flow

Logout is handled by calling the backend logout endpoint:

```javascript
const handleLogout = async () => {
  try {
    // Backend clears the HttpOnly cookie
    await axiosInstance.post("/auth/logout");
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    navigate("/");
  }
};
```

**Backend Responsibility:**

- Clear the HttpOnly cookie (set expiry to past date)
- Return success response

## Benefits of This Architecture

1. **Centralized Configuration** - All routes defined in one file (`router.ts`)
2. **Type Safety** - TypeScript types for loaders and actions
3. **Data Loading** - Loaders fetch data before render, eliminating loading states
4. **Form Handling** - Actions provide a standard pattern for mutations
5. **Nested Layouts** - Shared layouts with `<Outlet />` reduce code duplication
6. **Auth Guards** - Loader-based authentication prevents unauthorized access
7. **Code Splitting** - Component-based routes enable automatic code splitting
8. **Action-Only Routes** - Support for POST-like operations without UI

## Navigation Methods

### Declarative (Link component)

```tsx
import { Link } from "react-router";
<Link to="/dashboard">Dashboard</Link>;
```

### Imperative (useNavigate hook)

Used for programmatic navigation:

```tsx
const navigate = useNavigate();
navigate("/dashboard/all-events");
```

## Summary

This project follows React Router v7 best practices with:

- **Centralized route configuration** in `src/routes/router.js`
- **Data loaders** in `src/routes/loaders/` for prefetching (one file per page)
- **Actions** in `src/routes/actions/` for form submissions (one file per page)
- **Nested routes** with shared layouts
- **Authentication guards** via loaders
- **Programmatic navigation** with hooks

### Complete Router Structure

```
src/
├── routes/
│   ├── router.js              # Main router configuration
│   ├── loaders/              # Data loading functions
│   │   ├── rootLayout.js     # Auth verification loader
│   │   ├── dashboard.js      # Dashboard data loader
│   │   └── taskDetails.js    # Task details loader
│   └── actions/              # Form handling functions
│       ├── login.js          # Login action
│       ├── createTask.js     # Create task action
│       ├── updateTask.js     # Update task action
│       └── deleteTask.js     # Delete task action
├── pages/                    # Page components
│   ├── Login/
│   │   └── LoginPage.jsx
│   └── Dashboard/
│       ├── Dashboard.jsx
│       └── TaskDetails.jsx
└── layouts/                  # Layout components
    └── RootLayout.jsx
```

### Key Principles

1. **Separation of Concerns**: Keep loaders, actions, and components in separate directories
2. **One File Per Page**: Each page gets its own loader and action file
3. **Import Organization**: Group imports by type (pages, loaders, actions) in router.js
4. **Consistent Naming**: Use descriptive names matching the page/route (e.g., `dashboard.js`, `taskDetails.js`)
5. **Centralized Routing**: All route configuration in one place (`router.js`)

### Documentation References

- [React Router Route Object](https://reactrouter.com/start/data/route-object#loader)
- [Data Loading](https://reactrouter.com/start/data/data-loading)
- [Actions](https://reactrouter.com/start/data/actions)
