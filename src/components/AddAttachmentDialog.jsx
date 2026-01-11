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

export function AddAttachmentDialog({ open, onOpenChange }) {
  const submit = useSubmit();
  const navigation = useNavigation();

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const isSubmitting = navigation.state === "submitting";

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file size (10MB = 10485760 bytes)
    if (selectedFile.size > 10485760) {
      setError("File size must not exceed 10MB");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("intent", "add-attachment");
    formData.append("file", file);

    submit(formData, {
      method: "post",
      encType: "multipart/form-data",
    });
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setFile(null);
      setError("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Attachment</DialogTitle>
          <DialogDescription>
            Upload a file to attach to this task (max 10MB)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Input */}
          <div className="space-y-2">
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full h-20 border-dashed"
              onClick={() => document.getElementById("file").click()}
            >
              <div className="flex flex-col items-center gap-1">
                <Upload className="size-5 text-muted-foreground" />
                <span className="text-sm">Click to select a file</span>
                <span className="text-xs text-muted-foreground">
                  PDF, DOC, XLS, JPG, PNG, TXT
                </span>
              </div>
            </Button>

            {/* Selected File Preview */}
            {file && (
              <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileIcon className="size-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="h-6 w-6 p-0"
                >
                  <X className="size-4" />
                </Button>
              </div>
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
            <Button type="submit" disabled={isSubmitting || !file}>
              {isSubmitting ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
