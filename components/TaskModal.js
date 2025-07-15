"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Eye } from "lucide-react"
import { TASKS } from "@/lib/tasks"
import DailyPlannerView from "./DailyPlannerView"
import ImageViewerModal from "./ImageViewerModal"

export default function TaskModal({ date, userId, onClose }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPlannerView, setShowPlannerView] = useState(false)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    fetchTasksForDate()
  }, [date, userId])

  const fetchTasksForDate = async () => {
    try {
      const response = await fetch(`/api/tasks/daily?date=${date}&userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error("Error fetching tasks for date:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00")
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleImageClick = (images, index) => {
    setSelectedImages(images)
    setSelectedImageIndex(index)
    setShowImageViewer(true)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-lg max-w-5xl w-full max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div>
              <h2 className="text-xl font-semibold text-white">Tasks for {formatDate(date)}</h2>
              <p className="text-slate-400 text-sm">This is a read-only view of your activity.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPlannerView(true)}
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                📅 View Planner
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-4">
              {TASKS.map((task) => {
                const userTask = tasks.find((t) => t.taskId === task.id)
                return (
                  <Card key={task.id} className="bg-slate-700 border-slate-600">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{task.icon}</span>
                          <span className="text-lg">{task.title}</span>
                        </div>
                        <Badge variant={userTask?.completed ? "default" : "destructive"}>
                          {userTask?.completed ? "✓ Completed" : "✗ Not Completed"}
                        </Badge>
                      </CardTitle>
                      <p className="text-slate-300 text-sm">{task.description}</p>
                    </CardHeader>

                    {userTask && (
                      <CardContent className="pt-0">
                        {userTask.textInput && (
                          <div className="mb-3">
                            <h4 className="text-white font-medium mb-1">Entry:</h4>
                            <p className="text-slate-300 bg-slate-600 p-2 rounded whitespace-pre-wrap">
                              {userTask.textInput}
                            </p>
                          </div>
                        )}

                        {userTask.files && userTask.files.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-white font-medium mb-2">Files:</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {userTask.files.map((file, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={file || "/placeholder.svg"}
                                    alt={`Task file ${index + 1}`}
                                    className="w-full h-[1/1] aspect-[2/1] object-contain bg-black rounded cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handleImageClick(userTask.files, index)}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded transition-all flex items-center justify-center">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="opacity-0 group-hover:opacity-100 text-white w-full h-full hover:bg-white/20"
                                      onClick={() => handleImageClick(userTask.files, index)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {userTask.notes && (
                          <div>
                            <h4 className="text-white font-medium mb-1">Notes:</h4>
                            <p className="text-slate-300 bg-slate-600 p-2 rounded whitespace-pre-wrap">
                              {userTask.notes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Daily Planner View */}
          {showPlannerView && (
            <DailyPlannerView date={date} userId={userId} onClose={() => setShowPlannerView(false)} />
          )}

          <div className="p-6 border-t border-slate-700">
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <ImageViewerModal
          images={selectedImages}
          currentIndex={selectedImageIndex}
          onClose={() => setShowImageViewer(false)}
          canDelete={false}
        />
      )}
    </>
  )
}
