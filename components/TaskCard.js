"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronUp, CheckCircle2, Eye, Calendar, Trash2 } from "lucide-react"
import ImageViewerModal from "./ImageViewerModal"
import DailyPlannerModal from "./DailyPlannerModal"
import { useToast } from "@/hooks/use-toast"

export default function TaskCard({ task, userTask, onUpdate, user }) {
  const [expanded, setExpanded] = useState(false)
  const [formData, setFormData] = useState({
    completed: false,
    textInput: userTask?.textInput || "",
    fullBottleFiles: [], // For hydration full bottle images
    emptyBottleFiles: [], // For hydration empty bottle images
    files: [], // For other tasks
    notes: userTask?.notes || "",
  })
  const [uploading, setUploading] = useState(false)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showPlannerModal, setShowPlannerModal] = useState(false)
  const { toast } = useToast()

  // Update form data when userTask changes
  useEffect(() => {
    if (userTask) {
      setFormData({
        completed: userTask.completed || false,
        textInput: userTask.textInput || "",
        fullBottleFiles: [],
        emptyBottleFiles: [],
        files: [],
        notes: userTask.notes || "",
      })
    }
  }, [userTask])

  const handleFileChange = (e, fieldType = "default") => {
    const files = Array.from(e.target.files)

    if (task.id === "hydration") {
      if (fieldType === "full") {
        setFormData((prev) => ({
          ...prev,
          fullBottleFiles: files,
        }))
      } else if (fieldType === "empty") {
        setFormData((prev) => ({
          ...prev,
          emptyBottleFiles: files,
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        files: files,
      }))
    }
  }

  const handleDeleteImage = async (imageIndex) => {
    try {
      const today = new Date().toISOString().split("T")[0]

      const submitData = new FormData()
      submitData.append("taskId", task.id)
      submitData.append("date", today)
      submitData.append("completed", formData.completed)
      submitData.append("textInput", formData.textInput)
      submitData.append("notes", formData.notes)
      submitData.append("removeImageIndex", imageIndex)
      submitData.append("action", "deleteImage")

      const response = await fetch("/api/tasks/update", {
        method: "POST",
        body: submitData,
        credentials: "include",
      })

      if (response.ok) {
        await onUpdate(task.id, submitData)
        setShowImageViewer(false)
        toast({
          title: "Success",
          description: "Image deleted successfully!",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete image",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const handleCompletionToggle = async (checked) => {
    const newFormData = { ...formData, completed: checked }
    setFormData(newFormData)

    const submitData = new FormData()
    submitData.append("taskId", task.id)
    submitData.append("date", new Date().toISOString().split("T")[0])
    submitData.append("completed", checked)
    submitData.append("textInput", newFormData.textInput)
    submitData.append("notes", newFormData.notes)
    submitData.append("action", "updateCompletion")

    try {
      await onUpdate(task.id, submitData)
      toast({
        title: checked ? "Task completed!" : "Task unmarked",
        description: checked ? "Great job! Keep up the momentum!" : "Task marked as incomplete",
        variant: checked ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error updating completion status:", error)
      setFormData({ ...formData, completed: !checked })
      toast({
        title: "Error",
        description: "Failed to update completion status",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      const today = new Date().toISOString().split("T")[0]
      const submitData = new FormData()
      submitData.append("taskId", task.id)
      submitData.append("date", today)
      submitData.append("completed", formData.completed)
      submitData.append("textInput", formData.textInput)
      submitData.append("notes", formData.notes)
      submitData.append("action", "updateTask")

      // Handle hydration task files separately
      if (task.id === "hydration") {
        // Add full bottle files
        formData.fullBottleFiles.forEach((file, index) => {
          submitData.append(`full_bottle_${index}`, file)
        })
        // Add empty bottle files
        formData.emptyBottleFiles.forEach((file, index) => {
          submitData.append(`empty_bottle_${index}`, file)
        })
      } else {
        // Add regular files for other tasks - ONLY add new files, don't duplicate existing ones
        formData.files.forEach((file, index) => {
          submitData.append(`new_file_${index}`, file) // Use different key to avoid conflicts
        })
      }

      const response = await fetch("/api/tasks/update", {
        method: "POST",
        body: submitData,
        credentials: "include",
      })

      if (response.ok) {
        await onUpdate(task.id, submitData)

        // Clear file inputs after successful upload
        setFormData((prev) => ({
          ...prev,
          fullBottleFiles: [],
          emptyBottleFiles: [],
          files: [],
        }))

        // Reset file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]')
        fileInputs.forEach((input) => (input.value = ""))

        toast({
          title: "Success",
          description: "Task details saved successfully!",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to save task",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleCardClick = (e) => {
    if (
      e.target.type === "checkbox" ||
      e.target.tagName === "BUTTON" ||
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.closest("button") ||
      e.target.closest('input[type="checkbox"]') ||
      e.target.closest('input[type="file"]')
    ) {
      return
    }
    setExpanded(!expanded)
  }

  const renderFileUploadSection = () => {
    if (task.id === "hydration") {
      return (
        <div className="space-y-6">
          {/* Full Bottle Section */}
          <div className="space-y-3">
            <Label className="text-white text-lg font-medium">Water Bottle (Full) 💧</Label>
            <Input
              type="file"
              onChange={(e) => handleFileChange(e, "full")}
              accept="image/*"
              multiple
              className="bg-slate-700 border-slate-600 text-white"
            />

            {/* Show full bottle images right after the input */}
            {userTask?.files && userTask.files.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {userTask.files.slice(0, Math.ceil(userTask.files.length / 2)).map((file, index) => (
                  <div key={`full-display-${index}`} className="relative group">
                    <img
                      src={file || "/placeholder.svg"}
                      alt={`Full bottle ${index + 1}`}
                      className="w-full h-[1/1] aspect-[2/1] object-contain bg-black rounded cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        setSelectedImageIndex(index)
                        setShowImageViewer(true)
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded transition-all flex items-center justify-center">
                    <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex(index)
                    setShowImageViewer(true)
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteImage(index)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Empty Bottle Section */}
          <div className="space-y-3">
            <Label className="text-white text-lg font-medium">Empty Bottle 🏺</Label>
            <Input
              type="file"
              onChange={(e) => handleFileChange(e, "empty")}
              accept="image/*"
              multiple
              className="bg-slate-700 border-slate-600 text-white"
            />

            {/* Show empty bottle images right after the input */}
            {userTask?.files && userTask.files.length > Math.ceil(userTask.files.length / 2) && (
              <div className="grid grid-cols-2 gap-2">
                {userTask.files.slice(Math.ceil(userTask.files.length / 2)).map((file, index) => (
                  <div key={`empty-display-${index}`} className="relative group">
                    <img
                      src={file || "/placeholder.svg"}
                      alt={`Empty bottle ${index + 1}`}
                      className="w-full h-[1/1] aspect-[2/1] object-contain bg-black rounded cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        setSelectedImageIndex(Math.ceil(userTask.files.length / 2) + index)
                        setShowImageViewer(true)
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded transition-all flex items-center justify-center">
                    <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex(index)
                    setShowImageViewer(true)
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteImage(Math.ceil(userTask.files.length / 2) + index)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <Label className="text-white">{task.multipleFiles ? "Upload Files" : "Upload File"}</Label>
        <Input
          type="file"
          onChange={handleFileChange}
          multiple={task.multipleFiles}
          accept="image/*"
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>
    )
  }

  const renderExistingImages = () => {
    // Skip for hydration task as images are shown inline
    if (task.id === "hydration" || !userTask?.files || userTask.files.length === 0) return null

    return (
      <div className="space-y-2">
        <Label className="text-white">Uploaded Images:</Label>
        <div className="grid grid-cols-2 gap-2">
          {userTask.files.map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={file || "/placeholder.svg"}
                alt={`Task file ${index + 1}`}
                className="w-full h-[1/1] aspect-[2/1] object-contain bg-black rounded cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  setSelectedImageIndex(index)
                  setShowImageViewer(true)
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded transition-all flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex(index)
                    setShowImageViewer(true)
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteImage(index)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderTaskSpecificContent = () => {
    if (task.id === "daily-schedule") {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setShowPlannerModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Open Daily Planner
            </Button>
          </div>
          {task.hasTextInput && (
            <div className="space-y-2">
              <Label className="text-white">Additional Notes</Label>
              <Textarea
                value={formData.textInput}
                onChange={(e) => setFormData({ ...formData, textInput: e.target.value })}
                placeholder="Add any additional schedule notes..."
                className="bg-slate-700 border-slate-600 text-white"
                rows={4}
              />
            </div>
          )}
        </div>
      )
    }

    if (task.id === "digital-detox") {
      return (
        <div className="space-y-2">
          <Label className="text-white">Notes</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add notes about your digital detox success..."
            className="bg-slate-700 border-slate-600 text-white"
            rows={3}
          />
        </div>
      )
    }

    if (task.hasTextInput) {
      return (
        <div className="space-y-2">
          <Label className="text-white">{task.inputPlaceholder || "Input"}</Label>
          {task.id === "reading" ? (
            <Textarea
              value={formData.textInput}
              onChange={(e) => setFormData({ ...formData, textInput: e.target.value })}
              placeholder={task.inputPlaceholder}
              className="bg-slate-700 border-slate-600 text-white"
              rows={4}
            />
          ) : (
            <Input
              value={formData.textInput}
              onChange={(e) => setFormData({ ...formData, textInput: e.target.value })}
              placeholder={task.inputPlaceholder}
              className="bg-slate-700 border-slate-600 text-white"
            />
          )}
        </div>
      )
    }

    return null
  }

  return (
    <>
      <Card
        className={`border-slate-700 transition-all cursor-pointer hover:border-slate-600 ${
          formData.completed ? "bg-green-900/20 border-green-700 shadow-green-500/20 shadow-sm" : "bg-slate-800"
        }`}
        onClick={handleCardClick}
      >
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* White Checkbox */}
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={formData.completed}
                  onCheckedChange={handleCompletionToggle}
                  className="w-6 h-6 border-2 dark:border-white border-black data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 data-[state=unchecked]:bg-transparent"
                />
                {formData.completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl">{task.icon}</span>
                <div>
                  <span className={`text-black  ${formData.completed ? "line-through dark:text-green-300" : "dark:text-green-300"}`}>
                    {task.title}
                  </span>
                  {formData.completed ? (
                    <div className="text-sm dark:text-green-400 text-black font-medium">✓ Completed - Great job!</div>
                  ) : (
                    <div className="text-sm text-slate-400">Click to expand and fill details</div>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(!expanded)
              }}
              className="text-slate-400 hover:text-white"
            >
              {expanded ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </CardTitle>
          <p className="text-slate-300 text-sm ml-12">{task.description}</p>
        </CardHeader>

        {expanded && (
          <CardContent onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Task-specific content */}
              {renderTaskSpecificContent()}

              {/* File upload section */}
              {task.hasFileUpload && renderFileUploadSection()}

              {/* Existing images (for non-hydration tasks) */}
              {renderExistingImages()}

              {/* Notes section (for tasks other than digital-detox) */}
              {task.id !== "digital-detox" && (
                <div className="space-y-2">
                  <Label className="text-white">Notes (Optional)</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any additional notes..."
                    className="bg-slate-700 border-slate-600 text-white"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={uploading}>
                  {uploading ? "Saving..." : "Save Details"}
                </Button>
                {!formData.completed && (
                  <div className="text-slate-400 text-sm flex items-center px-3">
                    Fill details first, then check ✓ to complete
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Image Viewer Modal */}
      {showImageViewer && userTask?.files && (
        <ImageViewerModal
          images={userTask.files}
          currentIndex={selectedImageIndex}
          onClose={() => setShowImageViewer(false)}
          onDelete={handleDeleteImage}
          canDelete={true}
        />
      )}

      {/* Daily Planner Modal */}
      {showPlannerModal && (
        <DailyPlannerModal isOpen={showPlannerModal} onClose={() => setShowPlannerModal(false)} user={user} />
      )}
    </>
  )
}
