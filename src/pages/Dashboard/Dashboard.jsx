import { useState, useMemo } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { Search, Plus, MoreVertical, Users as UsersIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

const ITEMS_PER_PAGE = 6;

export default function Dashboard() {
  const { events } = useLoaderData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("ongoing");

  // Filter events by status and search query
  const filteredEvents = useMemo(() => {
    let filtered = events || [];

    // Filter by tab (ongoing/completed)
    filtered = filtered.filter((event) => {
      if (activeTab === "ongoing") {
        return event.status !== "completed";
      } else {
        return event.status === "completed";
      }
    });

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((event) =>
        event.event_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-muted-foreground">
          Manage and track your events
        </p>
      </div>

      {/* Main Content */}
      <div className="rounded-lg border bg-card">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Tabs Header with Search and Create Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 border-b">
            <TabsList>
              <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-9 w-full sm:w-[250px]"
                />
              </div>
              <Button onClick={() => navigate("/dashboard/events/create")} className="w-full sm:w-auto">
                <Plus className="size-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>

          {/* Ongoing Tab Content */}
          <TabsContent value="ongoing" className="p-4 sm:p-6 mt-0">
            {currentEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? "No events found matching your search" : "No ongoing events"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <EventPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </TabsContent>

          {/* Completed Tab Content */}
          <TabsContent value="completed" className="p-4 sm:p-6 mt-0">
            {currentEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? "No events found matching your search" : "No completed events"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <EventPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function EventCard({ event }) {
  const navigate = useNavigate();

  // Calculate progress (mock data - adjust based on your actual event structure)
  const totalAttendees = event.total_attendees || 0;
  const checkedInAttendees = event.checked_in_attendees || 0;
  const progressPercentage = totalAttendees > 0
    ? Math.round((checkedInAttendees / totalAttendees) * 100)
    : 0;

  // Format date
  const eventDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Get status badge
  const getStatusBadge = () => {
    if (event.status === "completed") {
      return <Badge variant="secondary">Completed</Badge>;
    }
    if (event.status === "in_progress") {
      return <Badge variant="default">In Progress</Badge>;
    }
    return <Badge variant="outline">Upcoming</Badge>;
  };

  return (
    <div
      onClick={() => navigate(`/dashboard/events/${event.id}`)}
      className="group border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base mb-1 truncate">
            {event.event_name}
          </h3>
          {eventDate && (
            <p className="text-sm text-muted-foreground">
              Due: {eventDate}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          {getStatusBadge()}
          <Button variant="ghost" size="icon" className="size-8" onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="size-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {checkedInAttendees}/{totalAttendees} attended
          </span>
          <span className="font-medium">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Team Members Avatars (if available) */}
      {event.organizers && event.organizers.length > 0 && (
        <div className="flex items-center gap-2 mt-3">
          <div className="flex -space-x-2">
            {event.organizers.slice(0, 3).map((organizer, index) => (
              <Avatar key={index} className="size-6 border-2 border-background">
                <AvatarFallback className="text-xs">
                  {organizer.name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            ))}
            {event.organizers.length > 3 && (
              <div className="flex items-center justify-center size-6 rounded-full bg-muted border-2 border-background text-xs">
                +{event.organizers.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
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
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        {getPageNumbers().map((page, index) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
