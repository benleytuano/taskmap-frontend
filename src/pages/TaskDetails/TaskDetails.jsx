import { useState, useEffect, useMemo } from "react";
import { useLoaderData, useNavigate, useActionData, useSubmit, useRouteLoaderData } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Download, FileIcon, UserPlus, Edit, Trash2, X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddWatcherDialog } from "@/components/AddWatcherDialog";
import { AddAssigneeDialog } from "@/components/AddAssigneeDialog";
import { AddAttachmentDialog } from "@/components/AddAttachmentDialog";
import { EditTaskModal } from "@/components/EditTaskModal";
import { DeleteTaskDialog } from "@/components/DeleteTaskDialog";
import { AssignmentDetailsModal } from "@/components/AssignmentDetailsModal";

export default function TaskDetails() {
  const { task } = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const submit = useSubmit();

  // Get current user from parent route (RootLayout)
  const currentUser = useRouteLoaderData("root");

  // Determine if current user is just a watcher (not creator, not admin)
  const isAdmin = currentUser?.role === "admin";
  const isCreator = task?.created_by === currentUser?.id;
  const isWatcher = task?.watchers?.some((w) => w.user.id === currentUser?.id);
  const isOnlyWatcher = isWatcher && !isAdmin && !isCreator;

  // Debug: Log permission state (remove after testing)
  console.log("Permission Debug:", {
    currentUserId: currentUser?.id,
    currentUserRole: currentUser?.role,
    taskCreatedBy: task?.created_by,
    isAdmin,
    isCreator,
    isWatcher,
    isOnlyWatcher,
    watchers: task?.watchers
  });

  // Dialog states
  const [isWatcherDialogOpen, setIsWatcherDialogOpen] = useState(false);
  const [isAssigneeDialogOpen, setIsAssigneeDialogOpen] = useState(false);
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Assignee search and pagination
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [assigneePage, setAssigneePage] = useState(1);
  const ASSIGNEES_PER_PAGE = 5;

  // Filter and paginate assignments
  const filteredAssignments = useMemo(() => {
    if (!task.assignments) return [];
    if (!assigneeSearch.trim()) return task.assignments;

    return task.assignments.filter((assignment) => {
      const name = assignment.assignee.full_name || assignment.assignee.name || "";
      const email = assignment.assignee.email || "";
      return (
        name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
        email.toLowerCase().includes(assigneeSearch.toLowerCase())
      );
    });
  }, [task.assignments, assigneeSearch]);

  const totalAssigneePages = Math.ceil(filteredAssignments.length / ASSIGNEES_PER_PAGE);
  const paginatedAssignments = useMemo(() => {
    const start = (assigneePage - 1) * ASSIGNEES_PER_PAGE;
    return filteredAssignments.slice(start, start + ASSIGNEES_PER_PAGE);
  }, [filteredAssignments, assigneePage]);

  // Reset page when search changes
  useEffect(() => {
    setAssigneePage(1);
  }, [assigneeSearch]);

  // Handle action response
  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        toast.success(actionData.message);
        // Close all dialogs on success
        setIsWatcherDialogOpen(false);
        setIsAssigneeDialogOpen(false);
        setIsAttachmentDialogOpen(false);
        setIsEditModalOpen(false);
        setIsAssignmentModalOpen(false);
      } else {
        toast.error(actionData.message || "An error occurred");
      }
    }
  }, [actionData]);

  // Remove handlers
  const handleRemoveWatcher = (userId) => {
    const formData = new FormData();
    formData.append("intent", "remove-watcher");
    formData.append("user_id", userId);
    submit(formData, { method: "post" });
  };

  const handleRemoveAttachment = (attachmentId) => {
    const formData = new FormData();
    formData.append("intent", "remove-attachment");
    formData.append("attachment_id", attachmentId);
    submit(formData, { method: "post" });
  };

  const handleRemoveAssignment = (assignmentId) => {
    const formData = new FormData();
    formData.append("intent", "remove-assignment");
    formData.append("assignment_id", assignmentId);
    submit(formData, { method: "post" });
  };

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get priority badge styling
  const getPriorityBadge = (priority) => {
    const styles = {
      urgent: "bg-red-100 text-red-700 hover:bg-red-100",
      rush: "bg-orange-100 text-orange-700 hover:bg-orange-100",
      standard: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    };
    return styles[priority] || styles.standard;
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusValue = typeof status === "string" ? status : status?.value;
    const styles = {
      pending: { bg: "bg-gray-100", text: "text-gray-700", icon: "🔵", label: "Pending" },
      in_progress: { bg: "bg-blue-100", text: "text-blue-700", icon: "🔵", label: "In Progress" },
      for_review: { bg: "bg-yellow-100", text: "text-yellow-700", icon: "🟡", label: "For Review" },
      revision: { bg: "bg-orange-100", text: "text-orange-700", icon: "🟠", label: "Revision" },
      completed: { bg: "bg-green-100", text: "text-green-700", icon: "✅", label: "Completed" },
      approved: { bg: "bg-green-100", text: "text-green-700", icon: "✅", label: "Approved" },
    };
    return styles[statusValue] || styles.pending;
  };

  // Calculate progress
  const totalAssignments = task.assignments?.length || 0;
  const completedAssignments = task.assignments?.filter(
    (a) => {
      const status = typeof a.status === "string" ? a.status : a.status?.value;
      return status === "completed" || status === "approved";
    }
  ).length || 0;
  const progressPercentage = totalAssignments > 0
    ? Math.round((completedAssignments / totalAssignments) * 100)
    : 0;

  // Get user initials
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
  };

  return (
    <div className="space-y-2">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/dashboard")}
        className="mb-1"
      >
        <ArrowLeft className="size-4 mr-2" />
        Back to Tasks
      </Button>

      {/* Task Details - No Card Wrapper */}
      <div className="border rounded-lg p-3">
        {/* Header with Actions */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge className={`${getPriorityBadge(task.priority.value)} text-xs px-2 py-0`}>
                {task.priority.label.toUpperCase()}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Due: {formatDate(task.deadline)}
              </span>
              <span className="text-xs text-muted-foreground">
                • Created: {formatDate(task.created_at)}
              </span>
            </div>
            <h1 className="text-lg font-bold">{task.title}</h1>
          </div>

          {/* Action Buttons - Only show for admin/creator */}
          {!isOnlyWatcher && (
            <div className="flex gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {task.description}
          </p>
        )}

        <Separator className="my-2" />

        {/* Task Attachments - Scrollable */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-semibold">Task Attachments ({task.attachments?.length || 0})</h3>
            {!isOnlyWatcher && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs px-2"
                onClick={() => setIsAttachmentDialogOpen(true)}
              >
                <FileIcon className="size-3 mr-1" />
                Add File
              </Button>
            )}
          </div>
          {task.attachments && task.attachments.length > 0 ? (
            <div className="max-h-[120px] overflow-y-auto space-y-1 pr-1">
              {task.attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-1.5 border rounded hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <FileIcon className="size-3 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{file.original_filename}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {file.file_size_formatted || `${(file.file_size / 1024).toFixed(0)} KB`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] px-1.5" asChild>
                      <a href={file.download_url} download={file.original_filename}>
                        <Download className="size-3 mr-0.5" />
                        Download
                      </a>
                    </Button>
                    {!isOnlyWatcher && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveAttachment(file.id)}
                      >
                        <X className="size-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2">No attachments</p>
          )}
        </div>

        <Separator className="my-2" />

        {/* Watchers */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-semibold">Watchers ({task.watchers?.length || 0})</h3>
            {!isOnlyWatcher && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs px-2"
                onClick={() => setIsWatcherDialogOpen(true)}
              >
                <UserPlus className="size-3 mr-1" />
                Add
              </Button>
            )}
          </div>
          {task.watchers && task.watchers.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {task.watchers.map((w) => (
                <Badge key={w.id} variant="secondary" className="text-xs pr-1">
                  {w.user.full_name || w.user.name}
                  {!isOnlyWatcher && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 ml-1 hover:bg-red-100"
                      onClick={() => handleRemoveWatcher(w.user.id)}
                    >
                      <X className="size-2.5" />
                    </Button>
                  )}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No watchers</p>
          )}
        </div>

        <Separator className="my-2" />

        {/* Progress Overview - Inside Task Details */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold">Progress Overview</span>
            <span className="text-xs text-muted-foreground">
              {completedAssignments}/{totalAssignments} ({progressPercentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Assignees */}
      <div className="border rounded-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">
            Assignees ({task.assignments?.length || 0})
          </h3>
          {!isOnlyWatcher && (
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => setIsAssigneeDialogOpen(true)}
            >
              <UserPlus className="size-4 mr-2" />
              Add Assignee
            </Button>
          )}
        </div>

        {/* Search */}
        {task.assignments && task.assignments.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search assignees..."
              value={assigneeSearch}
              onChange={(e) => setAssigneeSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Assignee Table */}
        {paginatedAssignments.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">Name</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-2">Status</th>
                  {!isOnlyWatcher && (
                    <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedAssignments.map((assignment) => {
                  const statusStyle = getStatusBadge(assignment.status);
                  return (
                    <tr
                      key={assignment.id}
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setIsAssignmentModalOpen(true);
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 bg-muted">
                            <AvatarFallback className="text-xs bg-gray-200 text-gray-700">
                              {getInitials(assignment.assignee?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{assignment.assignee?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {assignment.assignee?.section || assignment.assignee?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`${statusStyle.bg} ${statusStyle.text} hover:${statusStyle.bg} text-xs`}>
                          {statusStyle.label}
                        </Badge>
                      </td>
                      {!isOnlyWatcher && (
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAssignment(assignment.id);
                            }}
                          >
                            <X className="size-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : task.assignments && task.assignments.length > 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No assignees found matching "{assigneeSearch}"
            </p>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No assignees yet. Click "Add Assignee" to assign someone to this task.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalAssigneePages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {((assigneePage - 1) * ASSIGNEES_PER_PAGE) + 1}-
              {Math.min(assigneePage * ASSIGNEES_PER_PAGE, filteredAssignments.length)} of {filteredAssignments.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => setAssigneePage((p) => Math.max(1, p - 1))}
                disabled={assigneePage === 1}
              >
                <ChevronLeft className="size-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {assigneePage} of {totalAssigneePages}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => setAssigneePage((p) => Math.min(totalAssigneePages, p + 1))}
                disabled={assigneePage === totalAssigneePages}
              >
                Next
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Status History */}
      {task.status_history && task.status_history.length > 0 && (
        <div className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold">Status History</h3>
            <Button size="sm" variant="ghost" className="h-6 text-xs px-2">
              View Full Log
            </Button>
          </div>
          <ul className="space-y-0.5 text-xs">
            {task.status_history.slice(0, 4).map((history, index) => (
              <li key={index} className="text-muted-foreground">
                • {history.assignee_name}: {history.from_status} → {history.to_status} (
                {formatDate(history.changed_at)})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dialogs */}
      <AddWatcherDialog
        open={isWatcherDialogOpen}
        onOpenChange={setIsWatcherDialogOpen}
        existingWatchers={task.watchers || []}
      />
      <AddAssigneeDialog
        open={isAssigneeDialogOpen}
        onOpenChange={setIsAssigneeDialogOpen}
        existingAssignments={task.assignments || []}
      />
      <AddAttachmentDialog
        open={isAttachmentDialogOpen}
        onOpenChange={setIsAttachmentDialogOpen}
      />
      <EditTaskModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        task={task}
      />
      <DeleteTaskDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        task={task}
      />
      <AssignmentDetailsModal
        open={isAssignmentModalOpen}
        onOpenChange={setIsAssignmentModalOpen}
        assignment={selectedAssignment}
      />
    </div>
  );
}

