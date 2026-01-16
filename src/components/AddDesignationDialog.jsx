import { useState, useEffect } from "react";
import { useSubmit, useNavigation } from "react-router";
import { Search } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import axiosInstance from "@/services/api";

export function AddDesignationDialog({ open, onOpenChange }) {
  const submit = useSubmit();
  const navigation = useNavigation();

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [organizationalTitle, setOrganizationalTitle] = useState("");
  const [taskSourceLabel, setTaskSourceLabel] = useState("");
  const [isDivisionHead, setIsDivisionHead] = useState(false);

  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (open) {
      fetchUsers();
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setSearchQuery("");
    setSelectedUserId(null);
    setOrganizationalTitle("");
    setTaskSourceLabel("");
    setIsDivisionHead(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      setUsers(response.data.data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    const name = user.full_name || user.name || "";
    const email = user.email || "";
    const employeeId = user.employee_id || "";

    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employeeId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUserId || !organizationalTitle || !taskSourceLabel) return;

    const formData = new FormData();
    formData.append("intent", "create");
    formData.append("user_id", selectedUserId);
    formData.append("organizational_title", organizationalTitle);
    formData.append("task_source_label", taskSourceLabel);
    formData.append("is_division_head", isDivisionHead);

    submit(formData, { method: "post" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Organizational Designation</DialogTitle>
          <DialogDescription>
            Assign an organizational title and task source label to a user
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Selection */}
          <div className="space-y-2">
            <Label>Select User *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {selectedUser && (
              <div className="p-3 border rounded-md bg-primary/10 border-primary">
                <p className="text-sm font-medium">{selectedUser.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedUser.email} - {selectedUser.employee_id}
                </p>
              </div>
            )}

            <div className="border rounded-md p-2 max-h-48 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">Loading users...</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">No users found</p>
              ) : (
                <div className="space-y-1">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUserId(user.id)}
                      className={`w-full flex items-center justify-between p-2 rounded transition-colors text-left ${
                        selectedUserId === user.id
                          ? "bg-primary/10 border border-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{user.full_name || user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email} - {user.employee_id}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs ml-2">
                        {user.role.label}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Organizational Title */}
          <div className="space-y-2">
            <Label htmlFor="org-title">Organizational Title *</Label>
            <Input
              id="org-title"
              placeholder="e.g., Division Chief, Personnel Officer II"
              value={organizationalTitle}
              onChange={(e) => setOrganizationalTitle(e.target.value)}
              required
            />
          </div>

          {/* Task Source Label */}
          <div className="space-y-2">
            <Label htmlFor="task-label">Task Source Label *</Label>
            <Input
              id="task-label"
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
              id="division-head"
              checked={isDivisionHead}
              onCheckedChange={setIsDivisionHead}
            />
            <Label
              htmlFor="division-head"
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
              disabled={isSubmitting || !selectedUserId || !organizationalTitle || !taskSourceLabel}
            >
              {isSubmitting ? "Adding..." : "Add Designation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
