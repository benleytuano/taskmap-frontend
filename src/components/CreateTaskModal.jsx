import { useState, useEffect } from "react"
import { useSubmit, useActionData, useNavigation, useRevalidator } from "react-router"
import { X, Upload, FileIcon, Search } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import axiosInstance from "@/services/api"

export function CreateTaskModal({ open, onOpenChange }) {
  const submit = useSubmit()
  const actionData = useActionData()
  const navigation = useNavigation()
  const revalidator = useRevalidator()

  const [users, setUsers] = useState([])
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "",
    assigned_to: [],
  })

  const [attachments, setAttachments] = useState([])
  const [assigneeSearch, setAssigneeSearch] = useState("")

  const isSubmitting = navigation.state === "submitting"

  // Fetch users when modal opens
  useEffect(() => {
    if (open) {
      fetchUsers()
      // Reset form when modal opens
      setFormData({
        title: "",
        description: "",
        deadline: "",
        priority: "",
        assigned_to: [],
      })
      setAttachments([])
      setAssigneeSearch("")
      setErrors({})
    }
  }, [open])

  // Handle action response
  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        // Task created successfully - close modal and reload data
        onOpenChange(false)
        revalidator.revalidate()
      } else if (actionData.errors) {
        // Show validation errors
        setErrors(actionData.errors)
      }
    }
  }, [actionData, onOpenChange, revalidator])

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/users")
      setUsers(response.data.data.users)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const toggleUser = (userId, field) => {
    setFormData(prev => {
      const currentList = prev[field]
      const isSelected = currentList.includes(userId)

      return {
        ...prev,
        [field]: isSelected
          ? currentList.filter(id => id !== userId)
          : [...currentList, userId]
      }
    })

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)

    // Validate file count
    if (attachments.length + files.length > 5) {
      setErrors(prev => ({
        ...prev,
        attachments: ["Maximum 5 files allowed"]
      }))
      return
    }

    // Validate file size (10MB = 10485760 bytes)
    const invalidFiles = files.filter(file => file.size > 10485760)
    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        attachments: ["File size must not exceed 10MB"]
      }))
      return
    }

    setAttachments(prev => [...prev, ...files])
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.attachments
      return newErrors
    })
  }

  const removeFile = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = ["Task title is required"]
    }

    if (!formData.deadline) {
      newErrors.deadline = ["Deadline is required"]
    } else {
      const selectedDate = new Date(formData.deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate <= today) {
        newErrors.deadline = ["Deadline must be a future date"]
      }
    }

    if (!formData.priority) {
      newErrors.priority = ["Priority is required"]
    }

    if (formData.assigned_to.length === 0) {
      newErrors.assigned_to = ["At least one assignee is required"]
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Create FormData for multipart/form-data submission
    const data = new FormData()

    data.append("title", formData.title)
    data.append("description", formData.description)
    data.append("deadline", formData.deadline)
    data.append("priority", formData.priority)

    // Append assigned users
    formData.assigned_to.forEach(userId => {
      data.append("assigned_to[]", userId)
    })

    // Append files
    attachments.forEach(file => {
      data.append("attachments[]", file)
    })

    // Submit using React Router's submit function
    submit(data, {
      method: "post",
      encType: "multipart/form-data",
    })
  }

  const getSelectedUserNames = (userIds) => {
    return users
      .filter(user => userIds.includes(user.id))
      .map(user => user.name)
  }

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
    user.employee_id.toLowerCase().includes(assigneeSearch.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new task
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error */}
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
            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline">
                Deadline <span className="text-red-500">*</span>
              </Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange("deadline", e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.deadline && (
                <p className="text-sm text-red-500">{errors.deadline[0]}</p>
              )}
            </div>

            {/* Priority */}
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
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={assigneeSearch}
                  onChange={(e) => setAssigneeSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* User List */}
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Loading users...</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No users found</p>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map(user => (
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
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email} • {user.employee_id}
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

              {/* Selected Users */}
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

          {/* File Attachments */}
          <div className="space-y-2">
            <Label htmlFor="attachments">
              Attachments (Optional)
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
                  disabled={attachments.length >= 5}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
                <span className="text-sm text-muted-foreground">
                  Max 5 files, 10MB each
                </span>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded-md"
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
                        onClick={() => removeFile(index)}
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
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
