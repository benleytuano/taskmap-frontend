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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function EditDesignationDialog({ open, onOpenChange, designation }) {
  const submit = useSubmit();
  const navigation = useNavigation();

  const [organizationalTitle, setOrganizationalTitle] = useState("");
  const [taskSourceLabel, setTaskSourceLabel] = useState("");
  const [isDivisionHead, setIsDivisionHead] = useState(false);

  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (open && designation) {
      setOrganizationalTitle(designation.organizational_title || "");
      setTaskSourceLabel(designation.task_source_label || "");
      setIsDivisionHead(designation.is_division_head || false);
    }
  }, [open, designation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!organizationalTitle || !taskSourceLabel) return;

    const formData = new FormData();
    formData.append("intent", "update");
    formData.append("designationId", designation.id);
    formData.append("user_id", designation.user_id);
    formData.append("organizational_title", organizationalTitle);
    formData.append("task_source_label", taskSourceLabel);
    formData.append("is_division_head", isDivisionHead);

    submit(formData, { method: "post" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Organizational Designation</DialogTitle>
          <DialogDescription>
            Update the organizational title and task source label for{" "}
            <span className="font-medium">{designation?.user?.full_name}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Info (Read-only) */}
          <div className="p-3 border rounded-md bg-muted">
            <p className="text-sm font-medium">{designation?.user?.full_name}</p>
            <p className="text-xs text-muted-foreground">
              {designation?.user?.email} - {designation?.user?.employee_id}
            </p>
          </div>

          {/* Organizational Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-org-title">Organizational Title *</Label>
            <Input
              id="edit-org-title"
              placeholder="e.g., Division Chief, Personnel Officer II"
              value={organizationalTitle}
              onChange={(e) => setOrganizationalTitle(e.target.value)}
              required
            />
          </div>

          {/* Task Source Label */}
          <div className="space-y-2">
            <Label htmlFor="edit-task-label">Task Source Label *</Label>
            <Input
              id="edit-task-label"
              placeholder="e.g., Division Chief, Personnel Office"
              value={taskSourceLabel}
              onChange={(e) => setTaskSourceLabel(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              This label will appear on tasks created by this user
            </p>
          </div>

          {/* Division Head Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-division-head"
              checked={isDivisionHead}
              onCheckedChange={setIsDivisionHead}
            />
            <Label
              htmlFor="edit-division-head"
              className="text-sm font-normal cursor-pointer"
            >
              This user is a division head
            </Label>
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
            <Button
              type="submit"
              disabled={isSubmitting || !organizationalTitle || !taskSourceLabel}
            >
              {isSubmitting ? "Updating..." : "Update Designation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
