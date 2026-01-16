import { Outlet, useLoaderData, useLocation, Link } from "react-router"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useInactivityLogout } from "@/hooks/useInactivityLogout"
import { NotificationBell } from "@/components/NotificationBell"

export default function RootLayout() {
  const user = useLoaderData();
  const location = useLocation();
  const isAdmin = user?.role === "admin";

  // Auto logout after 30 seconds of inactivity
  useInactivityLogout(300000);

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const path = location.pathname;

    // Dashboard index (admin)
    if (path === "/dashboard" && isAdmin) {
      return [{ label: "Dashboard", href: null }];
    }
    
    // My Tasks index (user)
    if (path === "/dashboard/my-tasks") {
      return [{ label: "My Tasks", href: null }];
    }

    // User task details
    if (path.startsWith("/dashboard/my-tasks/")) {
      return [
        { label: "My Tasks", href: "/dashboard/my-tasks" },
        { label: "Task Details", href: null },
      ];
    }

    // Admin task details
    if (path.startsWith("/dashboard/tasks/")) {
      return [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Task Details", href: null },
      ];
    }

    // Settings
    if (path === "/dashboard/settings") {
      return [
        { label: isAdmin ? "Dashboard" : "My Tasks", href: isAdmin ? "/dashboard" : "/dashboard/my-tasks" },
        { label: "Settings", href: null },
      ];
    }

    // Organizational Designations
    if (path === "/dashboard/organizational-designations") {
      return [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Organizational Designations", href: null },
      ];
    }

    // Default
    return [{ label: isAdmin ? "Dashboard" : "My Tasks", href: null }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 justify-between transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                    <BreadcrumbItem className={index < breadcrumbs.length - 1 ? "hidden md:block" : ""}>
                      {crumb.href ? (
                        <BreadcrumbLink asChild>
                          <Link to={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2 px-4">
            <NotificationBell />
          </div>
        </header>
        <div className="flex flex-1 flex-col p-4 pt-2">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
