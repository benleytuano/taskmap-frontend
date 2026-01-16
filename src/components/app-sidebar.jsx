import * as React from "react"
import {
  LayoutDashboard,
  ListTodo,
  Settings2,
  ClipboardList,
  Eye,
  Shield,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

// Navigation items for admin users (static items only)
const adminNavBase = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  // {
  //   title: "Task",
  //   url: "/dashboard/task",
  //   icon: ListTodo,
  // },
  // {
  //   title: "Settings",
  //   url: "/dashboard/settings",
  //   icon: Settings2,
  // },
]

// Navigation items for regular users (static items only)
const userNavBase = [
  {
    title: "My Tasks",
    url: "/dashboard/my-tasks",
    icon: ClipboardList,
  },
  // {
  //   title: "Settings",
  //   url: "/dashboard/settings",
  //   icon: Settings2,
  // },
]

// Dynamic nav item for watched tasks
const watchedTasksNavItem = {
  title: "My Watched Tasks",
  url: "/dashboard/my-watched-tasks",
  icon: Eye,
}

export function AppSidebar({ user, ...props }) {
  // Determine which nav items to show based on user role
  const isAdmin = user?.role === "admin"
  const isSuperAdmin = user?.role === "superadmin"
  const hasWatchedTasks = (user?.watchedTasksCount || 0) > 0

  // Build nav items based on user role
  let navItems = isAdmin || isSuperAdmin ? [...adminNavBase] : [...userNavBase]

  // Add "My Watched Tasks" if user has watched tasks
  if (hasWatchedTasks) {
    if (isAdmin || isSuperAdmin) {
      // Insert after Dashboard for admins
      navItems.splice(1, 0, watchedTasksNavItem)
    } else {
      // Insert after My Tasks for regular users
      navItems.splice(1, 0, watchedTasksNavItem)
    }
  }

  // Add superadmin-only items
  if (isSuperAdmin) {
    navItems.push({
      title: "Organizational Designations",
      url: "/dashboard/organizational-designations",
      icon: Shield,
    })
  }

  const homeUrl = isAdmin || isSuperAdmin ? "/dashboard" : "/dashboard/my-tasks"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href={homeUrl}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img
                    src="/taskmap_icon.png"
                    alt="TaskMap"
                    className="size-8 object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">TaskMap</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
