import { useState, useMemo } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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

const ITEMS_PER_PAGE = 5;

export default function MyTasks() {
  const { assignments } = useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("pending");

  // Calculate stats based on assignment status
  const stats = useMemo(() => {
    const pending = assignments?.filter(
      (a) => a.status?.value === "pending"
    ).length || 0;
    const inProgress = assignments?.filter(
      (a) => a.status?.value === "in_progress" || a.status?.value === "for_review" || a.status?.value === "revision"
    ).length || 0;
    const completed = assignments?.filter(
      (a) => a.status?.value === "completed" || a.status?.value === "approved"
    ).length || 0;

    return { pending, inProgress, completed };
  }, [assignments]);

  // Filter assignments by tab and search query
  const filteredAssignments = useMemo(() => {
    let filtered = assignments || [];

    // Filter by tab
    if (activeTab === "pending") {
      filtered = filtered.filter(
        (a) => a.status?.value === "pending"
      );
    } else if (activeTab === "in_progress") {
      filtered = filtered.filter(
        (a) => a.status?.value === "in_progress" || a.status?.value === "for_review" || a.status?.value === "revision"
      );
    } else if (activeTab === "completed") {
      filtered = filtered.filter(
        (a) => a.status?.value === "completed" || a.status?.value === "approved"
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((assignment) =>
        assignment.task?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [assignments, activeTab, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentAssignments = filteredAssignments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border rounded-lg">
          <CardContent className="p-4">
            <p className="text-sm text-amber-600 font-medium">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="border rounded-lg">
          <CardContent className="p-4">
            <p className="text-sm text-blue-600 font-medium">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card className="border rounded-lg">
          <CardContent className="p-4">
            <p className="text-sm text-green-600 font-medium">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Tabs Header with Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
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

        {/* Pending Tab Content */}
        <TabsContent value="pending" className="mt-0">
          <AssignmentList assignments={currentAssignments} searchQuery={searchQuery} emptyMessage="No pending tasks" />
          {filteredAssignments.length > 0 && totalPages > 1 && (
            <div className="mt-4">
              <TaskPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </TabsContent>

        {/* In Progress Tab Content */}
        <TabsContent value="in_progress" className="mt-0">
          <AssignmentList assignments={currentAssignments} searchQuery={searchQuery} emptyMessage="No tasks in progress" />
          {filteredAssignments.length > 0 && totalPages > 1 && (
            <div className="mt-4">
              <TaskPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </TabsContent>

        {/* Completed Tab Content */}
        <TabsContent value="completed" className="mt-0">
          <AssignmentList assignments={currentAssignments} searchQuery={searchQuery} emptyMessage="No completed tasks" />
          {filteredAssignments.length > 0 && totalPages > 1 && (
            <div className="mt-4">
              <TaskPagination
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

function AssignmentList({ assignments, searchQuery, emptyMessage }) {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          {searchQuery ? "No tasks found matching your search" : emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {assignments.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </div>
  );
}

function AssignmentCard({ assignment }) {
  const navigate = useNavigate();
  const task = assignment.task;

  // Format deadline date
  const deadline = task?.deadline
    ? new Date(task.deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Get status badge styling
  const getStatusBadge = (statusValue) => {
    const styles = {
      pending: { bg: "bg-gray-100", text: "text-gray-700", label: "Pending" },
      in_progress: { bg: "bg-blue-100", text: "text-blue-700", label: "In Progress" },
      for_review: { bg: "bg-yellow-100", text: "text-yellow-700", label: "For Review" },
      revision: { bg: "bg-orange-100", text: "text-orange-700", label: "Needs Revision" },
      completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
      approved: { bg: "bg-green-100", text: "text-green-700", label: "Approved" },
    };
    return styles[statusValue] || styles.pending;
  };

  // Get priority badge styling
  const getPriorityBadge = (priorityValue) => {
    const styles = {
      urgent: { bg: "bg-red-100", text: "text-red-700", label: "URGENT" },
      rush: { bg: "bg-orange-100", text: "text-orange-700", label: "RUSH" },
      standard: { bg: "bg-blue-100", text: "text-blue-700", label: "STANDARD" },
    };
    return styles[priorityValue] || styles.standard;
  };

  const statusStyle = getStatusBadge(assignment.status?.value);
  const priorityStyle = getPriorityBadge(task?.priority?.value);

  return (
    <div
      onClick={() => navigate(`/dashboard/my-tasks/${assignment.id}`)}
      className="border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer bg-card"
    >
      {/* Title and Badges */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1 truncate">{task?.title}</h3>
          <div className="flex gap-1.5 flex-wrap">
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityStyle.bg} ${priorityStyle.text} font-medium`}>
              {priorityStyle.label}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusStyle.bg} ${statusStyle.text}`}>
              {statusStyle.label}
            </span>
          </div>
        </div>
      </div>

      {/* Task Details */}
      <div className="space-y-1">
        {deadline && (
          <p className="text-xs text-muted-foreground">Due: {deadline}</p>
        )}
        {task?.creator?.name && (
          <p className="text-xs text-muted-foreground">Assigned by: {task.creator.name}</p>
        )}
        {assignment.progress_note && (
          <p className="text-xs text-muted-foreground italic truncate">
            Note: {assignment.progress_note}
          </p>
        )}
      </div>
    </div>
  );
}

function TaskPagination({ currentPage, totalPages, onPageChange }) {
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
