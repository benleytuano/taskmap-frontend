import { useState, useEffect } from "react";
import {
  useLoaderData,
  useNavigate,
  useActionData,
  useSubmit,
} from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  FileIcon,
  Calendar,
  User,
  Clock,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserTaskDetails() {
  const { task, userAssignment } = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const submit = useSubmit();

  // Form state for updating assignment
  const [status, setStatus] = useState(
    userAssignment?.status?.value || "pending"
  );
  const [progressNote, setProgressNote] = useState(
    userAssignment?.progress_note || ""
  );
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle action response
  useEffect(() => {
    if (actionData) {
      setIsSubmitting(false);
      if (actionData.success) {
        toast.success(actionData.message || "Assignment updated successfully");
        // Clear attachments on success
        setAttachments([]);
      } else {
        toast.error(actionData.message || "Failed to update assignment");
      }
    }
  }, [actionData]);

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const totalFiles = attachments.length + files.length;

    if (totalFiles > 5) {
      toast.error("Maximum 5 files allowed");
      return;
    }

    const invalidFiles = files.filter((file) => file.size > 10485760); // 10MB
    if (invalidFiles.length > 0) {
      toast.error("File size must not exceed 10MB");
      return;
    }

    setAttachments((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("intent", "update-assignment");
    formData.append("assignment_id", userAssignment.id);
    formData.append("status", status);
    formData.append(
      "original_status",
      userAssignment?.status?.value || "pending"
    );
    formData.append("progress_note", progressNote);

    // Add attachments
    attachments.forEach((file) => {
      formData.append("attachments[]", file);
    });

    submit(formData, {
      method: "post",
      encType: "multipart/form-data",
    });
  };

  // Handle submit for review
  const handleSubmitForReview = () => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("intent", "submit-for-review");
    formData.append("assignment_id", userAssignment.id);

    submit(formData, { method: "post" });
  };

  // Format dates
  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return "N/A";
    const options = {
      month: "long",
      day: "numeric",
      year: "numeric",
    };

    if (includeTime) {
      options.hour = "numeric";
      options.minute = "2-digit";
    }

    return new Date(dateString).toLocaleDateString("en-US", options);
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
  const getStatusBadge = (statusValue) => {
    const styles = {
      pending: { bg: "bg-gray-100", text: "text-gray-700", label: "Pending" },
      in_progress: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        label: "In Progress",
      },
      for_review: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "For Review",
      },
      revision: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        label: "Revision",
      },
      completed: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Completed",
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Approved",
      },
    };
    return styles[statusValue] || styles.pending;
  };

  // Check if task is overdue
  const isOverdue = task.deadline && new Date(task.deadline) < new Date();

  // Status options based on current status (valid transitions)
  const getStatusOptions = () => {
    const currentStatus = userAssignment?.status?.value;

    if (currentStatus === "revision") {
      return [{ value: "revision", label: "Revision" }];
    }

    if (currentStatus === "pending") {
      return [
        { value: "pending", label: "Pending" },
        { value: "in_progress", label: "In Progress" },
      ];
    }

    if (currentStatus === "in_progress") {
      return [
        { value: "pending", label: "Pending" },
        { value: "in_progress", label: "In Progress" },
      ];
    }

    return [
      { value: currentStatus, label: getStatusBadge(currentStatus).label },
    ];
  };

  const statusOptions = getStatusOptions();
  const canSubmitForReview =
    userAssignment?.status?.value === "in_progress" ||
    userAssignment?.status?.value === "revision";

  const currentStatusStyle = getStatusBadge(
    userAssignment?.status?.value || "pending"
  );

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/dashboard/my-tasks")}
        className="mb-1"
      >
        <ArrowLeft className="size-4 mr-2" />
        Back to My Tasks
      </Button>

      {/* Task Details Card */}
      <div className="border rounded-lg p-4">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge
              className={`${getPriorityBadge(
                task.priority?.value
              )} text-xs px-2 py-0`}
            >
              {task.priority?.label?.toUpperCase() || "STANDARD"}
            </Badge>
            <Badge
              className={`${currentStatusStyle.bg} ${currentStatusStyle.text} text-xs px-2 py-0`}
            >
              {currentStatusStyle.label}
            </Badge>
            {isOverdue &&
              userAssignment?.status?.value !== "completed" &&
              userAssignment?.status?.value !== "approved" && (
                <Badge variant="destructive" className="text-xs px-2 py-0">
                  Overdue
                </Badge>
              )}
          </div>
          <h1 className="text-xl font-bold mb-2">{task.title}</h1>
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}
        </div>

        <Separator className="my-4" />

        {/* Task Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Deadline</p>
              <p className="text-sm font-medium">{formatDate(task.deadline)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Assigned by</p>
              <p className="text-sm font-medium">
                {task.creator?.name || "Unknown"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium">
                {formatDate(task.created_at)}
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Task Attachments */}
        <div>
          <h3 className="text-sm font-semibold mb-2">
            Attachments ({task.attachments?.length || 0})
          </h3>
          {task.attachments && task.attachments.length > 0 ? (
            <div className="space-y-2">
              {task.attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 border rounded hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileIcon className="size-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {file.original_filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {file.file_size_formatted ||
                          `${(file.file_size / 1024).toFixed(0)} KB`}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    asChild
                  >
                    <a
                      href={file.download_url}
                      download={file.original_filename}
                    >
                      <Download className="size-3 mr-1" />
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">No attachments</p>
          )}
        </div>
      </div>

      {/* Admin Remarks (if any) */}
      {userAssignment?.assigner_remarks && (
        <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
          <h3 className="text-sm font-semibold mb-2 text-amber-800">
            Remarks from Admin
          </h3>
          <p className="text-sm text-amber-900">
            {userAssignment.assigner_remarks}
          </p>
        </div>
      )}

      {/* My Uploaded Files */}
      {userAssignment?.attachments && userAssignment.attachments.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">
            Your Uploaded Work ({userAssignment.attachments.length})
          </h3>
          <div className="space-y-2">
            {userAssignment.attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 border rounded hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileIcon className="size-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {file.original_filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file.file_size_formatted ||
                        `${(file.file_size / 1024).toFixed(0)} KB`}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  asChild
                >
                  <a href={file.download_url} download={file.original_filename}>
                    <Download className="size-3 mr-1" />
                    Download
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Assignment Form */}
      {userAssignment &&
        userAssignment.status?.value !== "approved" &&
        userAssignment.status?.value !== "completed" && (
          <div className="border rounded-lg p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold">Update Your Progress</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {userAssignment?.status?.value === "revision"
                  ? "Fix the issues mentioned in admin remarks, then submit for review when ready"
                  : "Update status, add notes, or upload files - all fields are optional"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Status Select */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={setStatus}
                  disabled={userAssignment?.status?.value === "revision"}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {userAssignment?.status?.value === "revision" && (
                  <p className="text-xs text-muted-foreground">
                    Status is locked. Submit your fixes to move forward.
                  </p>
                )}
              </div>

              {/* Progress Note */}
              <div className="space-y-2">
                <Label htmlFor="progress_note">Progress Note</Label>
                <Textarea
                  id="progress_note"
                  placeholder="Add notes about your progress..."
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                  rows={3}
                />
              </div>

              {/* File Attachments */}
              <div className="space-y-2">
                <Label htmlFor="attachments">
                  Upload Work Files ({attachments.length}/5)
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="attachments"
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("attachments").click()
                      }
                      disabled={attachments.length >= 5}
                      className="w-full sm:w-auto"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Add Files
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Max 5 files, 10MB each
                    </span>
                  </div>

                  {/* Selected Files */}
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded-md bg-green-50"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <FileIcon className="w-4 h-4 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(0)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-7 w-7 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>

                {canSubmitForReview && (
                  <Button
                    type="button"
                    onClick={handleSubmitForReview}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : userAssignment?.status?.value === "revision"
                      ? "Submit Fixes for Review"
                      : "Submit for Review"}
                  </Button>
                )}
              </div>
            </form>
          </div>
        )}

      {/* For Review State */}
      {userAssignment && userAssignment.status?.value === "for_review" && (
        <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
          <h3 className="text-sm font-semibold mb-2 text-yellow-800">
            Submitted for Review
          </h3>
          <p className="text-sm text-yellow-700">
            Your work has been submitted for review. Please wait for admin
            approval.
          </p>
          {userAssignment.submitted_at && (
            <p className="text-xs text-yellow-600 mt-2">
              Submitted on {formatDate(userAssignment.submitted_at, true)}
            </p>
          )}
        </div>
      )}

      {/* Completed/Approved State */}
      {userAssignment &&
        (userAssignment.status?.value === "approved" ||
          userAssignment.status?.value === "completed") && (
          <div className="border rounded-lg p-4 bg-green-50 border-green-200">
            <h3 className="text-sm font-semibold mb-2 text-green-800">
              Task Completed
            </h3>
            <p className="text-sm text-green-700">
              This task has been {userAssignment.status?.value}. Great work!
            </p>
            {userAssignment.progress_note && (
              <div className="mt-3 p-3 bg-white rounded border">
                <p className="text-xs text-muted-foreground mb-1">
                  Your final note:
                </p>
                <p className="text-sm">{userAssignment.progress_note}</p>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
