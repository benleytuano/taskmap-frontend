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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import axiosInstance from "@/services/api";

export function AddWatcherDialog({ open, onOpenChange, existingWatchers = [], existingAssignments = [] }) {
  const submit = useSubmit();
  const navigation = useNavigation();

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const isSubmitting = navigation.state === "submitting";

  // Get IDs of existing watchers and assignees to filter them out
  const existingWatcherIds = existingWatchers.map((w) => w.user.id);
  const existingAssigneeIds = existingAssignments.map((a) => a.assignee.id);

  useEffect(() => {
    if (open) {
      fetchUsers();
      setSearchQuery("");
      setSelectedUserIds([]);
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      setUsers(response.data.data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  // Filter users based on search and exclude existing watchers and assignees
  const filteredUsers = users.filter(
    (user) => {
      const name = user.full_name || user.name || "";
      const email = user.email || "";
      const employeeId = user.employee_id || "";

      return (
        !existingWatcherIds.includes(user.id) &&
        !existingAssigneeIds.includes(user.id) &&
        (name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employeeId.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  );

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) return;

    const formData = new FormData();
    formData.append("intent", "add-watcher");

    // Append each user ID with the user_ids[] parameter name
    selectedUserIds.forEach((userId) => {
      formData.append("user_ids[]", userId);
    });

    submit(formData, { method: "post" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Watchers</DialogTitle>
          <DialogDescription>
            Select one or more users to add as watchers for this task. Note: Assignees cannot be watchers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Selected Count */}
          {selectedUserIds.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
            </p>
          )}

          {/* User List */}
          <div className="border rounded-md p-3 max-h-64 overflow-y-auto">
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users available</p>
            ) : (
              <div className="space-y-1">
                {filteredUsers.map((user) => (
                  <label
                    key={user.id}
                    className={`flex items-center space-x-3 cursor-pointer p-2 rounded transition-colors ${
                      selectedUserIds.includes(user.id)
                        ? "bg-primary/10 border border-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Checkbox
                      checked={selectedUserIds.includes(user.id)}
                      onCheckedChange={() => toggleUserSelection(user.id)}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || selectedUserIds.length === 0}>
              {isSubmitting
                ? "Adding..."
                : `Add ${selectedUserIds.length} watcher${selectedUserIds.length !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
