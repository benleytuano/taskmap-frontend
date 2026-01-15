import { useState, useEffect } from "react";
import { useSubmit, useActionData } from "react-router";
import { Download, FileIcon, CheckCircle, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function AssignmentDetailsModal({ open, onOpenChange, assignment, onActionComplete }) {
  const submit = useSubmit();
  const actionData = useActionData();
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  // Handle action response - reset internal state
  useEffect(() => {
    if (actionData && actionData.success && isSubmitting) {
      setIsSubmitting(false);
      setRemarks("");
      setShowRevisionForm(false);
    }
  }, [actionData, isSubmitting]);

  if (!assignment) return null;

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
  };

  const getStatusBadge = (status) => {
    const statusValue = typeof status === "string" ? status : status?.value;
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

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleApprove = () => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("intent", "approve-assignment");
    formData.append("assignment_id", assignment.id);

    submit(formData, { method: "post" });
  };

  const handleRequestRevision = () => {
    if (!remarks.trim()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("intent", "request-revision");
    formData.append("assignment_id", assignment.id);
    formData.append("assigner_remarks", remarks);

    submit(formData, { method: "post" });
  };

  const statusStyle = getStatusBadge(assignment.status);
  const statusValue = typeof assignment.status === "string" ? assignment.status : assignment.status?.value;
  const isForReview = statusValue === "for_review";
  const isCompleted = statusValue === "completed" || statusValue === "approved";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Assignment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Assignee Info */}
          <div className="flex items-center gap-3">
            <Avatar className="size-12 bg-muted">
              <AvatarFallback className="text-sm bg-gray-200 text-gray-700">
                {getInitials(assignment.assignee?.full_name || assignment.assignee?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{assignment.assignee?.full_name || assignment.assignee?.name}</h3>
              <p className="text-sm text-muted-foreground">
                {assignment.assignee?.section || assignment.assignee?.email || "Staff"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div>
            <Label className="text-xs text-muted-foreground">Status</Label>
            <div className="mt-1">
              <Badge className={`${statusStyle.bg} ${statusStyle.text} hover:${statusStyle.bg}`}>
                {statusStyle.label}
              </Badge>
            </div>
          </div>

          {/* Submitted At (for review) */}
          {assignment.submitted_at && (
            <div>
              <Label className="text-xs text-muted-foreground">Submitted</Label>
              <p className="text-sm mt-1">{formatDate(assignment.submitted_at)}</p>
            </div>
          )}

          {/* Approved At */}
          {assignment.approved_at && (
            <div>
              <Label className="text-xs text-muted-foreground">Approved</Label>
              <p className="text-sm mt-1">{formatDate(assignment.approved_at)}</p>
            </div>
          )}

          {/* Progress Note */}
          {assignment.progress_note && (
            <div>
              <Label className="text-xs text-muted-foreground">Progress Note</Label>
              <div className="mt-1 p-3 bg-muted rounded-md">
                <p className="text-sm">{assignment.progress_note}</p>
              </div>
            </div>
          )}

          {/* Previous Remarks (if in revision) */}
          {assignment.assigner_remarks && (
            <div>
              <Label className="text-xs text-muted-foreground">Your Remarks</Label>
              <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-900">{assignment.assigner_remarks}</p>
              </div>
            </div>
          )}

          {/* Attachments - Only show when for_review, completed, or approved */}
          {assignment.attachments && assignment.attachments.length > 0 && (isForReview || isCompleted) && (
            <div>
              <Label className="text-xs text-muted-foreground">
                Attachments ({assignment.attachments.length})
              </Label>
              <div className="mt-1 space-y-2">
                {assignment.attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 border rounded-md bg-background"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileIcon className="size-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">
                        {file.original_filename || file.filename}
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 text-xs px-2" asChild>
                      <a href={file.download_url} download={file.original_filename || file.filename}>
                        <Download className="size-3 mr-1" />
                        Download
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions for "For Review" status */}
          {isForReview && !showRevisionForm && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This assignment is ready for your review.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="size-4 mr-2" />
                  {isSubmitting ? "Approving..." : "Approve"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRevisionForm(true)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <RotateCcw className="size-4 mr-2" />
                  Request Revision
                </Button>
              </div>
            </div>
          )}

          {/* Revision Form */}
          {isForReview && showRevisionForm && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="remarks">Revision Remarks <span className="text-red-500">*</span></Label>
                <Textarea
                  id="remarks"
                  placeholder="Explain what needs to be revised..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRevisionForm(false);
                    setRemarks("");
                  }}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestRevision}
                  disabled={isSubmitting || !remarks.trim()}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  {isSubmitting ? "Sending..." : "Send for Revision"}
                </Button>
              </div>
            </div>
          )}

          {/* Completed State */}
          {isCompleted && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-center">
              <CheckCircle className="size-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700 font-medium">
                This assignment has been completed
              </p>
              {assignment.approved_at && (
                <p className="text-xs text-green-600 mt-1">
                  Approved on {formatDate(assignment.approved_at)}
                </p>
              )}
            </div>
          )}

          {/* Close Button (when not for review) */}
          {!isForReview && !isCompleted && (
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
