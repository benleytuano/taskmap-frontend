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
import { AlertTriangle } from "lucide-react";

export function DeleteDesignationDialog({ open, onOpenChange, designation }) {
  const submit = useSubmit();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  const handleDelete = () => {
    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("designationId", designation.id);

    submit(formData, { method: "post" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="size-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Delete Organizational Designation</DialogTitle>
              <DialogDescription className="mt-1">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-3">
            Are you sure you want to delete the organizational designation for:
          </p>
          <div className="p-3 border rounded-md bg-muted">
            <p className="text-sm font-medium">{designation?.user?.full_name}</p>
            <p className="text-xs text-muted-foreground">
              {designation?.organizational_title} - {designation?.task_source_label}
            </p>
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
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete Designation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
