import { useState, useEffect } from "react";
import { useSubmit, useNavigation } from "react-router";
import { X, Upload, FileIcon, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import axiosInstance from "@/services/api";

export function EditTaskModal({ open, onOpenChange, task }) {
  const submit = useSubmit();
  const navigation = useNavigation();

  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "",
    assigned_to: [],
    watchers: [],
  });

  const [newAttachments, setNewAttachments] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [removeAttachmentIds, setRemoveAttachmentIds] = useState([]);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [watcherSearch, setWatcherSearch] = useState("");

  const isSubmitting = navigation.state === "submitting";

  // Initialize form with task data when modal opens
  useEffect(() => {
    if (open && task) {
      fetchUsers();
      // Format deadline for input[type="date"]
      const deadlineDate = task.deadline
        ? new Date(task.deadline).toISOString().split("T")[0]
        : "";

      setFormData({
        title: task.title || "",
        description: task.description || "",
        deadline: deadlineDate,
        priority: task.priority?.value || "",
        assigned_to: task.assignments?.map((a) => a.assignee.id) || [],
        watchers: task.watchers?.map((w) => w.user.id) || [],
      });
      setExistingAttachments(task.attachments || []);
      setNewAttachments([]);
      setRemoveAttachmentIds([]);
      setAssigneeSearch("");
      setWatcherSearch("");
      setErrors({});
    }
  }, [open, task]);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      setUsers(response.data.data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleUser = (userId, field) => {
    setFormData((prev) => {
      const currentList = prev[field];
      const isSelected = currentList.includes(userId);

      return {
        ...prev,
        [field]: isSelected
          ? currentList.filter((id) => id !== userId)
          : [...currentList, userId],
      };
    });

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const totalFiles =
      existingAttachments.length -
      removeAttachmentIds.length +
      newAttachments.length +
      files.length;

    if (totalFiles > 5) {
      setErrors((prev) => ({
        ...prev,
        attachments: ["Maximum 5 files allowed"],
      }));
      return;
    }

    const invalidFiles = files.filter((file) => file.size > 10485760);
    if (invalidFiles.length > 0) {
      setErrors((prev) => ({
        ...prev,
        attachments: ["File size must not exceed 10MB"],
      }));
      return;
    }

    setNewAttachments((prev) => [...prev, ...files]);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.attachments;
      return newErrors;
    });
  };

  const removeNewFile = (index) => {
    setNewAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (attachmentId) => {
    setRemoveAttachmentIds((prev) => [...prev, attachmentId]);
  };

  const restoreExistingFile = (attachmentId) => {
    setRemoveAttachmentIds((prev) => prev.filter((id) => id !== attachmentId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = ["Task title is required"];
    }

    if (!formData.deadline) {
      newErrors.deadline = ["Deadline is required"];
    }

    if (!formData.priority) {
      newErrors.priority = ["Priority is required"];
    }

    if (formData.assigned_to.length === 0) {
      newErrors.assigned_to = ["At least one assignee is required"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = new FormData();
    data.append("intent", "update-task");
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("deadline", formData.deadline);
    data.append("priority", formData.priority);

    formData.assigned_to.forEach((userId) => {
      data.append("assigned_to[]", userId);
    });

    formData.watchers.forEach((userId) => {
      data.append("watchers[]", userId);
    });

    newAttachments.forEach((file) => {
      data.append("attachments[]", file);
    });

    removeAttachmentIds.forEach((id) => {
      data.append("remove_attachments[]", id);
    });

    submit(data, {
      method: "post",
      encType: "multipart/form-data",
    });
  };

  const getSelectedUserNames = (userIds) => {
    return users
      .filter((user) => userIds.includes(user.id))
      .map((user) => user.full_name || user.name);
  };

  const filteredAssigneeUsers = users.filter(
    (user) => {
      const name = user.full_name || user.name || "";
      const email = user.email || "";
      const employeeId = user.employee_id || "";

      return (
        name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
        email.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
        employeeId.toLowerCase().includes(assigneeSearch.toLowerCase())
      );
    }
  );

  const filteredWatcherUsers = users.filter(
    (user) => {
      const name = user.full_name || user.name || "";
      const email = user.email || "";
      const employeeId = user.employee_id || "";

      return (
        name.toLowerCase().includes(watcherSearch.toLowerCase()) ||
        email.toLowerCase().includes(watcherSearch.toLowerCase()) ||
        employeeId.toLowerCase().includes(watcherSearch.toLowerCase())
      );
    }
  );

  const activeExistingAttachments = existingAttachments.filter(
    (att) => !removeAttachmentIds.includes(att.id)
  );
  const totalAttachments = activeExistingAttachments.length + newAttachments.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the task details below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
              {errors.general[0]}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter task title"
              maxLength={255}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title[0]}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter task description"
              rows={4}
              maxLength={5000}
            />
          </div>

          {/* Deadline and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">
                Deadline <span className="text-red-500">*</span>
              </Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange("deadline", e.target.value)}
              />
              {errors.deadline && (
                <p className="text-sm text-red-500">{errors.deadline[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="rush">Rush</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-500">{errors.priority[0]}</p>
              )}
            </div>
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label>
              Assign To <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={assigneeSearch}
                  onChange={(e) => setAssigneeSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Loading users...</p>
                ) : filteredAssigneeUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No users found</p>
                ) : (
                  <div className="space-y-2">
                    {filteredAssigneeUsers.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.assigned_to.includes(user.id)}
                          onChange={() => toggleUser(user.id, "assigned_to")}
                          className="rounded border-gray-300"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{user.full_name || user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email} - {user.employee_id}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {user.role.label}
                        </Badge>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {formData.assigned_to.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {getSelectedUserNames(formData.assigned_to).map((name, idx) => (
                    <Badge key={idx} variant="secondary">
                      {name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            {errors.assigned_to && (
              <p className="text-sm text-red-500">{errors.assigned_to[0]}</p>
            )}
          </div>

          {/* Watchers */}
          <div className="space-y-2">
            <Label>Watchers (Optional)</Label>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={watcherSearch}
                  onChange={(e) => setWatcherSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Loading users...</p>
                ) : filteredWatcherUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No users found</p>
                ) : (
                  <div className="space-y-2">
                    {filteredWatcherUsers.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.watchers.includes(user.id)}
                          onChange={() => toggleUser(user.id, "watchers")}
                          className="rounded border-gray-300"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{user.full_name || user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email} - {user.employee_id}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {user.role.label}
                        </Badge>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {formData.watchers.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {getSelectedUserNames(formData.watchers).map((name, idx) => (
                    <Badge key={idx} variant="secondary">
                      {name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label htmlFor="attachments">
              Attachments ({totalAttachments}/5)
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
                  onClick={() => document.getElementById("attachments").click()}
                  disabled={totalAttachments >= 5}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Add Files
                </Button>
                <span className="text-sm text-muted-foreground">
                  Max 5 files, 10MB each
                </span>
              </div>

              {/* Existing Attachments */}
              {existingAttachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Current Attachments:
                  </p>
                  {existingAttachments.map((file) => {
                    const isRemoved = removeAttachmentIds.includes(file.id);
                    return (
                      <div
                        key={file.id}
                        className={`flex items-center justify-between p-2 border rounded-md ${
                          isRemoved ? "opacity-50 bg-red-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileIcon className="w-4 h-4" />
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                isRemoved ? "line-through" : ""
                              }`}
                            >
                              {file.original_filename || file.filename}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {file.file_size_formatted || formatFileSize(file.file_size)}
                            </p>
                          </div>
                        </div>
                        {isRemoved ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => restoreExistingFile(file.id)}
                          >
                            Restore
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExistingFile(file.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* New Attachments */}
              {newAttachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    New Attachments:
                  </p>
                  {newAttachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded-md bg-green-50"
                    >
                      <div className="flex items-center gap-2">
                        <FileIcon className="w-4 h-4" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNewFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {errors.attachments && (
                <p className="text-sm text-red-500">{errors.attachments[0]}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
