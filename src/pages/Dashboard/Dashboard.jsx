import { useLoaderData } from "react-router";
import { LayoutDashboard, Users, Calendar, Settings } from "lucide-react";

export default function Dashboard() {
  const userData = useLoaderData();

  return (
    <>
      {/* Welcome Section */}
      <div className="mb-4">
        <h2 className="text-3xl font-bold mb-2">
          Welcome back{userData?.name ? `, ${userData.name}` : ""}!
        </h2>
        <p className="text-muted-foreground">
          Here's what's happening with your tasks today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
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
    </>
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
