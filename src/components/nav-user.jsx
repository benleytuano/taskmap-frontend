import { useNavigate } from "react-router"
import {
  ChevronsUpDown,
  LogOut,
  User,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import axiosInstance from "@/services/api"

export function NavUser({ user }) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()

  // Get user initials for avatar fallback
  const getInitials = (fullName) => {
    if (!fullName) return "U"
    const parts = fullName.split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return fullName.substring(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout")
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      navigate("/")
    }
  }

  if (!user) return null

  const displayName = user.full_name || user.name || "User"
  const initials = getInitials(displayName)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={displayName} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-gray-500">{user.employee_id || user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-72 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-start gap-3 px-2 py-2 text-left">
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src={user.avatar} alt={displayName} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 gap-0.5 text-sm leading-tight">
                  <span className="font-semibold">{displayName}</span>
                  <span className="text-xs text-gray-500">{user.employee_id}</span>
                  <span className="text-xs text-gray-600 mt-1">{user.email}</span>
                  {user.position && (
                    <span className="text-xs text-gray-500 mt-1">{user.position}</span>
                  )}
                  <span className="text-xs font-medium text-blue-600 mt-1 capitalize">{user.role}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem asChild>
              <a href="/dashboard/settings">
                <User />
                Profile
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator /> */}
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
