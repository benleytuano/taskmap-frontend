import { useLoaderData, useNavigate } from "react-router";
import { ArrowLeft, Download, FileIcon, UserPlus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TaskDetails() {
  const { task } = useLoaderData();
  const navigate = useNavigate();

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

          {/* Action Buttons */}
          <div className="flex gap-1 flex-shrink-0">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
              <Edit className="size-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="size-3.5" />
            </Button>
          </div>
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
            <h3 className="text-xs font-semibold">📁 Task Attachments ({task.attachments?.length || 0})</h3>
            <Button size="sm" variant="ghost" className="h-6 text-xs px-2">
              <FileIcon className="size-3 mr-1" />
              Add File
            </Button>
          </div>
          {task.attachments && task.attachments.length > 0 ? (
            <div className="max-h-[120px] overflow-y-auto space-y-1 pr-1">
              {task.attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-1.5 border rounded hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <FileIcon className="size-3 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{file.filename}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {(file.file_size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] px-1.5 flex-shrink-0" asChild>
                    <a href={file.file_path} target="_blank" rel="noopener noreferrer">
                      <Download className="size-3 mr-0.5" />
                      Download
                    </a>
                  </Button>
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
            <h3 className="text-xs font-semibold">👁 Watchers ({task.watchers?.length || 0})</h3>
            <Button size="sm" variant="ghost" className="h-6 text-xs px-2">
              <UserPlus className="size-3 mr-1" />
              Add
            </Button>
          </div>
          {task.watchers && task.watchers.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              {task.watchers.map((w) => w.user.name).join(", ")}
            </p>
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
      <div>
        <h3 className="text-xs font-semibold mb-1.5 px-1">Assignees</h3>
        <div className="space-y-1.5">
          {task.assignments && task.assignments.length > 0 ? (
            task.assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                getStatusBadge={getStatusBadge}
                getInitials={getInitials}
                formatDate={formatDate}
              />
            ))
          ) : (
            <div className="border rounded-lg p-4">
              <p className="text-xs text-muted-foreground text-center">
                No assignees yet
              </p>
            </div>
          )}
        </div>
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
    </div>
  );
}

function AssignmentCard({ assignment, getStatusBadge, getInitials, formatDate }) {
  const statusStyle = getStatusBadge(assignment.status);

  return (
    <div className="border rounded-lg p-2">
      <div className="space-y-2">
        {/* Assignee Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar className="size-7 bg-muted flex-shrink-0">
              <AvatarFallback className="text-[10px] bg-gray-200 text-gray-700">
                {getInitials(assignment.assignee.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-xs truncate">{assignment.assignee.name}</h4>
              <p className="text-[10px] text-muted-foreground">
                {assignment.assignee.section || "Staff"}
                {assignment.updated_at && assignment.status !== "pending" && (
                  <span className="ml-1">
                    • {assignment.status === "completed" || assignment.status === "approved"
                      ? "Completed"
                      : "Updated"}: {formatDate(assignment.updated_at)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <Badge className={`${statusStyle.bg} ${statusStyle.text} hover:${statusStyle.bg} text-[10px] px-1.5 py-0 flex-shrink-0`}>
            {statusStyle.icon} {statusStyle.label}
          </Badge>
        </div>

        {/* Progress Note */}
        {assignment.progress_note && (
          <div className="bg-muted/50 p-1.5 rounded text-xs">
            <span className="text-muted-foreground italic">"{assignment.progress_note}"</span>
          </div>
        )}

        {/* Assignment Attachments */}
        {assignment.attachments && assignment.attachments.length > 0 && (
          <div>
            <h5 className="text-[10px] font-medium mb-1 text-muted-foreground">Attachments:</h5>
            <div className="space-y-0.5">
              {assignment.attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-1 border rounded text-[10px]"
                >
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <FileIcon className="size-2.5 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{file.filename}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-5 text-[10px] px-1.5" asChild>
                    <a href={file.file_path} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin/Assigner Remarks */}
        {assignment.assigner_remarks && (
          <div className="bg-muted p-1.5 rounded">
            <h5 className="text-[10px] font-medium mb-0.5">Your Remarks:</h5>
            <p className="text-xs">{assignment.assigner_remarks}</p>
          </div>
        )}

        {/* Action Buttons for "For Review" status */}
        {assignment.status === "for_review" && (
          <div className="flex gap-1.5 pt-0.5">
            <Button size="sm" className="flex-1 h-7 text-xs">
              ✓ Approve
            </Button>
            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">
              ↩ Request Revision
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
