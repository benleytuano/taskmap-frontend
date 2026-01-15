import { useState } from "react";
import { useSubmit, useNavigation } from "react-router";
import { Upload, FileIcon, X } from "lucide-react";
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

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE = 10485760; // 10MB in bytes

export function AddAttachmentDialog({ open, onOpenChange, existingAttachments = [] }) {
  const submit = useSubmit();
  const navigation = useNavigation();

  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  const isSubmitting = navigation.state === "submitting";

  // Calculate remaining slots
  const existingCount = existingAttachments.length;
  const remainingSlots = MAX_ATTACHMENTS - existingCount;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setError("");

    if (selectedFiles.length === 0) {
      return;
    }

    // Check if adding these files would exceed the limit
    const totalFiles = files.length + selectedFiles.length;
    if (totalFiles > remainingSlots) {
      setError(`Cannot upload more files. Current: ${existingCount}, Max: ${MAX_ATTACHMENTS}. You can upload up to ${remainingSlots} more file(s).`);
      return;
    }

    // Validate each file size
    const invalidFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (invalidFiles.length > 0) {
      setError(`Some files exceed 10MB: ${invalidFiles.map(f => f.name).join(", ")}`);
      return;
    }

    // Add new files to the list
    setFiles(prev => [...prev, ...selectedFiles]);

    // Reset the input so the same file can be selected again if removed
    e.target.value = "";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    const formData = new FormData();
    formData.append("intent", "add-attachment");

    // Append each file with the files[] parameter name
    files.forEach(file => {
      formData.append("files[]", file);
    });

    submit(formData, {
      method: "post",
      encType: "multipart/form-data",
    });
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setFiles([]);
      setError("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Attachments</DialogTitle>
          <DialogDescription>
            Upload files to attach to this task (max 10MB per file, {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Input */}
          <div className="space-y-2 overflow-hidden">
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
              multiple
              className="hidden"
              disabled={remainingSlots === 0 || files.length >= remainingSlots}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full h-20 border-dashed"
              onClick={() => document.getElementById("file").click()}
              disabled={remainingSlots === 0 || files.length >= remainingSlots}
            >
              <div className="flex flex-col items-center gap-1">
                <Upload className="size-5 text-muted-foreground" />
                <span className="text-sm">
                  {remainingSlots === 0
                    ? "Maximum attachments reached"
                    : files.length >= remainingSlots
                    ? "Maximum files selected"
                    : "Click to select files"}
                </span>
                <span className="text-xs text-muted-foreground">
                  PDF, DOC, XLS, JPG, PNG, TXT
                </span>
              </div>
            </Button>

            {/* Selected Files Preview */}
            {files.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-2 p-2 border rounded-md bg-muted/50 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                      <FileIcon className="size-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1 overflow-hidden w-0">
                        <p className="text-sm font-medium truncate w-full">{file.name}</p>
                        <p className="text-xs text-muted-foreground truncate w-full">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0 flex-shrink-0"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Info Message */}
            {files.length > 0 && files.length < remainingSlots && (
              <p className="text-xs text-muted-foreground">
                {files.length} file{files.length !== 1 ? 's' : ''} selected. You can add {remainingSlots - files.length} more.
              </p>
            )}

            {/* Error Message */}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || files.length === 0}>
              {isSubmitting
                ? "Uploading..."
                : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
