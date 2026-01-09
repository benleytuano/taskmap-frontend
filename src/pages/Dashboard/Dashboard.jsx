import { useState, useMemo } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { Search, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CreateTaskModal } from "@/components/CreateTaskModal";

const ITEMS_PER_PAGE = 5;

export default function Dashboard() {
  const { events } = useLoaderData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("ongoing");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Filter tasks by completion status and search query
  const filteredEvents = useMemo(() => {
    let filtered = events || [];

    // Filter by tab (ongoing/completed)
    filtered = filtered.filter((task) => {
      const totalAssignments = task.assignments?.length || 0;
      const completedAssignments = task.assignments?.filter(
        a => a.status.value === "completed" || a.status.value === "approved"
      ).length || 0;

      const isCompleted = totalAssignments > 0 && completedAssignments === totalAssignments;

      if (activeTab === "ongoing") {
        return !isCompleted;
      } else {
        return isCompleted;
      }
    });

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((task) =>
        task.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [events, activeTab, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  // Reset to page 1 when changing tabs or search
  const handleTabChange = (value) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Header Section */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Manage and track your tasks
          </p>
        </div>
        <Button onClick={() => setIsTaskModalOpen(true)} size="sm">
          <Plus className="size-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Task Creation Modal */}
      <CreateTaskModal
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
      />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Tabs Header with Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <TabsList>
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 w-full sm:w-[300px] h-9"
            />
          </div>
        </div>

        {/* Ongoing Tab Content */}
        <TabsContent value="ongoing" className="mt-0">
          {currentEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No tasks found matching your search" : "No ongoing tasks"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentEvents.map((event) => (
                <TaskCard key={event.id} task={event} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredEvents.length > 0 && totalPages > 1 && (
            <div className="mt-4">
              <EventPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </TabsContent>

        {/* Completed Tab Content */}
        <TabsContent value="completed" className="mt-0">
          {currentEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No tasks found matching your search" : "No completed tasks"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentEvents.map((event) => (
                <TaskCard key={event.id} task={event} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredEvents.length > 0 && totalPages > 1 && (
            <div className="mt-4">
              <EventPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

function TaskCard({ task }) {
  const navigate = useNavigate();

  // Calculate progress based on assignments
  const totalAssignments = task.assignments?.length || 0;
  const completedAssignments = task.assignments?.filter(
    a => a.status.value === "completed" || a.status.value === "approved"
  ).length || 0;

  const progressPercentage = totalAssignments > 0
    ? Math.round((completedAssignments / totalAssignments) * 100)
    : 0;

  // Format deadline date
  const deadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Check if task is overdue
  const isOverdue = task.deadline && new Date(task.deadline) < new Date();

  // Get progress bar color
  const getProgressColor = () => {
    if (progressPercentage === 100) return "bg-green-500";
    if (progressPercentage >= 50) return "bg-blue-500";
    return "bg-blue-500";
  };

  // Get user initials
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
  };

  // Get assigned users (from assignments)
  const assignedUsers = task.assignments?.map(a => a.assignee) || [];

  return (
    <div
      onClick={() => navigate(`/dashboard/tasks/${task.id}`)}
      className="border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer bg-card"
    >
      {/* Title and Due Date */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-0.5 truncate">
            {task.title}
          </h3>
          {deadline && (
            <p className="text-xs text-muted-foreground">
              Due: {deadline}
            </p>
          )}
        </div>

        {/* Overdue Badge and User Avatars */}
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          {isOverdue && (
            <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 text-xs px-2 py-0">
              Overdue
            </Badge>
          )}

          {/* User Avatars */}
          {assignedUsers.length > 0 && (
            <div className="flex -space-x-2">
              {assignedUsers.slice(0, 2).map((user, index) => (
                <Avatar key={index} className="size-6 border-2 border-background bg-muted">
                  <AvatarFallback className="text-[10px] bg-gray-200 text-gray-700">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {assignedUsers.length > 2 && (
                <Avatar className="size-6 border-2 border-background bg-muted">
                  <AvatarFallback className="text-[10px] bg-gray-200 text-gray-700">
                    +{assignedUsers.length - 2}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className={`text-xs ${progressPercentage === 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
            {completedAssignments}/{totalAssignments} completed
          </span>
          <span className="text-xs font-medium">{progressPercentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${getProgressColor()}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function EventPagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("ellipsis");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <Pagination className="mt-0">
      <PaginationContent className="gap-1">
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={`h-8 px-2 text-xs ${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
          />
        </PaginationItem>

        {getPageNumbers().map((page, index) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis className="h-8 w-8" />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                className="cursor-pointer h-8 w-8 text-xs p-0"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={`h-8 px-2 text-xs ${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
