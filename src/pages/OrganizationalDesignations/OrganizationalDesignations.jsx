import { useState, useMemo, useEffect } from "react";
import { useLoaderData, useActionData } from "react-router";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddDesignationDialog } from "@/components/AddDesignationDialog";
import { EditDesignationDialog } from "@/components/EditDesignationDialog";
import { DeleteDesignationDialog } from "@/components/DeleteDesignationDialog";

export default function OrganizationalDesignations() {
  const { designations } = useLoaderData();
  const actionData = useActionData();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);

  // Handle action responses
  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        toast.success(actionData.message);
        setIsAddDialogOpen(false);
        setIsEditDialogOpen(false);
        setIsDeleteDialogOpen(false);
        setSelectedDesignation(null);
      } else if (actionData.error) {
        toast.error(actionData.error);
      }
    }
  }, [actionData]);

  // Filter designations by search query
  const filteredDesignations = useMemo(() => {
    if (!searchQuery.trim()) return designations;

    return designations.filter((designation) => {
      const userName = designation.user?.full_name || "";
      const email = designation.user?.email || "";
      const title = designation.organizational_title || "";
      const label = designation.task_source_label || "";

      return (
        userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [designations, searchQuery]);

  const handleEdit = (designation) => {
    setSelectedDesignation(designation);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (designation) => {
    setSelectedDesignation(designation);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      {/* Header Section */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Organizational Designations</h2>
          <p className="text-sm text-muted-foreground">
            Manage user organizational titles and task source labels
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
          <Plus className="size-4 mr-2" />
          Add Designation
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative w-full sm:w-[400px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, title, or label..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Designations Table */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Organizational Title</TableHead>
              <TableHead>Task Source Label</TableHead>
              <TableHead>Division Head</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDesignations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? "No designations found matching your search"
                    : "No organizational designations yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredDesignations.map((designation) => (
                <TableRow key={designation.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">
                        {designation.user?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {designation.user?.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {designation.user?.employee_id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{designation.organizational_title}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {designation.task_source_label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {designation.is_division_head ? (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        <Shield className="size-3 mr-1" />
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(designation)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(designation)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <AddDesignationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      {selectedDesignation && (
        <>
          <EditDesignationDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            designation={selectedDesignation}
          />
          <DeleteDesignationDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            designation={selectedDesignation}
          />
        </>
      )}
    </>
  );
}
