import * as React from "react"
import {
  LayoutDashboard,
  ListTodo,
  Settings2,
  ClipboardList,
  Eye,
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

// Navigation items for admin users
const adminNav = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Watched Tasks",
    url: "/dashboard/my-watched-tasks",
    icon: Eye,
  },
  {
    title: "Task",
    url: "/dashboard/task",
    icon: ListTodo,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings2,
  },
]

// Navigation items for regular users
const userNav = [
  {
    title: "My Tasks",
    url: "/dashboard/my-tasks",
    icon: ClipboardList,
  },
  {
    title: "My Watched Tasks",
    url: "/dashboard/my-watched-tasks",
    icon: Eye,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings2,
  },
]

export function AppSidebar({ user, ...props }) {
  // Determine which nav items to show based on user role
  const isAdmin = user?.role === "admin"
  const navItems = isAdmin ? adminNav : userNav
  const homeUrl = isAdmin ? "/dashboard" : "/dashboard/my-tasks"

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
