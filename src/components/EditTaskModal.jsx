import { useState, useEffect } from "react";
import { useSubmit, useNavigation } from "react-router";
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

export function EditTaskModal({ open, onOpenChange, task }) {
  const submit = useSubmit();
  const navigation = useNavigation();

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "",
  });

  const isSubmitting = navigation.state === "submitting";

  // Initialize form with task data when modal opens
  useEffect(() => {
    if (open && task) {
      // Format deadline for input[type="date"]
      const deadlineDate = task.deadline
        ? new Date(task.deadline).toISOString().split("T")[0]
        : "";

      setFormData({
        title: task.title || "",
        description: task.description || "",
        deadline: deadlineDate,
        priority: task.priority?.value || "",
      });
      setErrors({});
    }
  }, [open, task]);

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

    submit(data, {
      method: "post",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update task title, description, deadline, and priority. Use the dedicated buttons to manage assignees, watchers, and attachments.
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
