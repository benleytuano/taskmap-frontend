# Project Context

## Tech Stack

- **Framework**: React
- **Routing**: React Router
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
)
```

### Route Definitions
All routes are defined in `src/routes/router.ts` using `createBrowserRouter`:

```tsx
export const router = createBrowserRouter([
  // Public routes
  { path: "/", Component: Login, action: loginPostAction },
  { path: "/register", Component: Register },
  { path: "/attendance/scan", Component: CheckInPage },

  // Protected dashboard routes (nested)
  {
    id: "root",
    path: "/dashboard",
    Component: RootLayout,
    loader: rootLayoutLoader,
    children: [...]
  }
]);
```

## Route Structure

### Public Routes
- `/` - Login page with form submission action
- `/register` - Registration page
- `/attendance/scan` - QR code check-in page

### Protected Routes (Dashboard)
All dashboard routes are nested under `/dashboard` with a shared layout:

- `/dashboard` - Dashboard home (index route)
- `/dashboard/all-events` - All events list
- `/dashboard/events/:eventId` - Event details page
- `/dashboard/events/:eventId/delete` - Delete event action route
- `/dashboard/events/:eventId/upload-attendees` - Upload attendees action route

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
Loaders fetch data before rendering components:
```javascript
export default async function dashboardLoader() {
  try {
    // HttpOnly cookie is automatically sent with request
    const response = await axiosInstance.get("/events");
    return response.data;
  } catch (error) {
    // Handle errors...
    if (error.response?.status === 401) {
      return redirect("/");  // Redirect if unauthorized
    }
    throw error;
  }
}
```

**Note:** Auth verification happens at the layout level. Individual loaders just fetch data.

Key loader locations:
- `src/layouts/Loader/rootLayoutLoader.ts` - Auth verification for all dashboard routes
- `src/pages/Dashboard/Loader/dashboardLoader.ts` - Fetch events for dashboard
- `src/pages/Dashboard/Loader/allEventsLoader.ts` - Fetch all events
- `src/pages/Dashboard/Loader/eventDetailsLoader.ts` - Fetch single event details

### 3. Route Actions for Form Handling
Actions handle form submissions and mutations:
```tsx
export async function addEventAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const event_name = formData.get("event_name");

  try {
    const response = await axiosInstance.post("/events", {
      event_name,
      // ...
    });
    return { success: true, message: "Event created successfully" };
  } catch (error) {
    return { error: "Failed to create event" };
  }
}
```

Action locations:
- `src/pages/Login/Actions/postAction.ts` - Handle login
- `src/pages/Dashboard/Actions/addEventAction.ts` - Create new event
- `src/pages/Dashboard/Actions/updateEventAction.ts` - Update event
- `src/pages/Dashboard/Actions/deleteEventAction.ts` - Delete event
- `src/pages/Dashboard/Actions/uploadAttendeesAction.ts` - Upload attendee CSV/Excel

### 4. Action-Only Routes
Some routes exist only to handle actions without rendering a component:
```tsx
{ path: "events/:eventId/delete", action: deleteEventAction }
{ path: "events/:eventId/upload-attendees", action: uploadAttendeesAction }
```

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
Dynamic segments are used for event-specific routes:
```tsx
{ path: "events/:eventId", Component: EventDetails }
```

Parameters are accessed in loaders/actions via `params`:
```tsx
export default async function eventDetailsLoader({ params }: LoaderFunctionArgs) {
  const eventId = params.eventId;
  // ...
}
```

## Authentication Pattern

### Route Protection
Authentication is enforced at the layout level via `rootLayoutLoader`:
```javascript
export default async function rootLayoutLoader() {
  try {
    // Verify authentication by calling a protected endpoint
    // The HttpOnly cookie is automatically sent with the request
    const response = await axiosInstance.get("/auth/verify");
    return response.data; // Return user data if authenticated
  } catch (error) {
    // If verification fails, redirect to login
    return redirect("/");
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
<Link to="/dashboard">Dashboard</Link>
```

### Imperative (useNavigate hook)
Used for programmatic navigation:
```tsx
const navigate = useNavigate();
navigate("/dashboard/all-events");
```

## Summary

This project follows React Router v7 best practices with:
- Centralized route configuration
- Data loaders for prefetching
- Actions for form submissions
- Nested routes with shared layouts
- Authentication guards via loaders
- Programmatic navigation with hooks
