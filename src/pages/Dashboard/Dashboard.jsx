import { useLoaderData, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Users, Calendar, Settings } from "lucide-react";
import axiosInstance from "@/services/api";

export default function Dashboard() {
  const userData = useLoaderData();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <LayoutDashboard className="size-5" />
            </div>
            <h1 className="text-xl font-bold">TaskMap</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {userData?.email || "Welcome"}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="size-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back{userData?.name ? `, ${userData.name}` : ""}!
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your tasks today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            icon={<LayoutDashboard className="size-5" />}
            title="Total Tasks"
            value="0"
            description="Tasks created"
          />
          <StatCard
            icon={<Users className="size-5" />}
            title="Team Members"
            value="0"
            description="Active members"
          />
          <StatCard
            icon={<Calendar className="size-5" />}
            title="This Week"
            value="0"
            description="Tasks due"
          />
          <StatCard
            icon={<Settings className="size-5" />}
            title="Projects"
            value="0"
            description="Active projects"
          />
        </div>

        {/* Recent Activity Section */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">No recent activity</p>
              <p className="text-xs mt-1">Your tasks and updates will appear here</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, description }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
