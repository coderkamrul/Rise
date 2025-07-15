"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle2, XCircle, AlertTriangle, Eye } from "lucide-react";
import { TASKS } from "@/lib/tasks";
import ImageViewerModal from "./ImageViewerModal";
import DailyPlannerView from "./DailyPlannerView";

export default function AdminTaskModal({
  date,
  userId,
  userName,
  onClose,
  onSendWarning,
}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showPlannerView, setShowPlannerView] = useState(false);

  useEffect(() => {
    fetchTasksForDate();
  }, [date, userId]);

  const fetchTasksForDate = async () => {
    try {
      const response = await fetch(
        `/api/tasks/daily?date=${date}&userId=${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Error fetching tasks for date:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isToday = (dateStr) => {
    const today = new Date().toISOString().split("T")[0];
    return dateStr === today;
  };

  const getCompletionStats = () => {
    const completed = tasks.filter((task) => task.completed).length;
    const total = TASKS.length;
    return { completed, total };
  };

  const handleImageClick = (images, index) => {
    setSelectedImages(images);
    setSelectedImageIndex(index);
    setShowImageViewer(true);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="text-white">Loading tasks...</div>
        </div>
      </div>
    );
  }

  const stats = getCompletionStats();

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
        <div className="bg-slate-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-slate-700 p-6 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {userName}'s Tasks - {formatDate(date)}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <Badge
                    variant="outline"
                    className="text-slate-300 border-slate-500"
                  >
                    {stats.completed}/{stats.total} Tasks Completed
                  </Badge>
                  <span className="text-slate-400 text-sm">
                    Completion Rate:{" "}
                    {stats.total > 0
                      ? Math.round((stats.completed / stats.total) * 100)
                      : 0}
                    %
                  </span>
                  {isToday(date) && (
                    <Badge className="bg-blue-600 text-white">Today</Badge>
                  )}
                </div>
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
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-white hover:bg-slate-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid gap-4">
              {TASKS.map((task) => {
                const userTask = tasks.find((t) => t.taskId === task.id);
                const isCompleted = userTask?.completed || false;

                return (
                  <Card
                    key={task.id}
                    className={`border-slate-600 ${
                      isCompleted
                        ? "bg-green-900/20 border-green-700"
                        : "bg-slate-700"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <span className="text-2xl">{task.icon}</span>
                          </div>
                          <div>
                            <span
                              className={
                                isCompleted ? "text-green-300" : "text-white"
                              }
                            >
                              {task.title}
                            </span>
                            <p className="text-slate-400 text-sm font-normal mt-1">
                              {task.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isCompleted ? "default" : "destructive"}
                            className="bg-opacity-80"
                          >
                            {isCompleted ? "✓ Completed" : "✗ Not Completed"}
                          </Badge>
                          {!isCompleted && isToday(date) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                onSendWarning(userId, task.id, date)
                              }
                              className="flex items-center gap-1"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              Send Warning
                            </Button>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>

                    {userTask && (
                      <CardContent className="pt-0">
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Text Input */}
                          {userTask.textInput && (
                            <div>
                              <h4 className="text-white font-medium mb-2">
                                Entry:
                              </h4>
                              <div className="bg-slate-600 p-3 rounded-lg">
                                <p className="text-slate-300 whitespace-pre-wrap">
                                  {userTask.textInput}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {userTask.notes && (
                            <div>
                              <h4 className="text-white font-medium mb-2">
                                Notes:
                              </h4>
                              <div className="bg-slate-600 p-3 rounded-lg">
                                <p className="text-slate-300 whitespace-pre-wrap">
                                  {userTask.notes}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Files */}
                        {userTask.files && userTask.files.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-white font-medium mb-2">
                              Uploaded Files:
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {userTask.files.map((file, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={file || "/placeholder.svg"}
                                    alt={`Task file ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() =>
                                      handleImageClick(userTask.files, index)
                                    }
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg transition-all flex items-center justify-center">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="opacity-0 group-hover:opacity-100 text-white hover:bg-white/20"
                                      onClick={() =>
                                        handleImageClick(userTask.files, index)
                                      }
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Task Metadata */}
                        <div className="mt-4 pt-3 border-t border-slate-600">
                          <div className="flex items-center justify-between text-sm text-slate-400">
                            <span>
                              Last updated:{" "}
                              {new Date(userTask.updatedAt).toLocaleString()}
                            </span>
                            <span>Category: {task.category}</span>
                          </div>
                        </div>
                      </CardContent>
                    )}

                    {/* Show task requirements if not completed */}
                    {!userTask && (
                      <CardContent className="pt-0">
                        <div className="bg-slate-600 p-4 rounded-lg">
                          <p className="text-slate-300 text-sm">
                            <strong>Requirements:</strong>
                          </p>
                          <ul className="text-slate-400 text-sm mt-2 space-y-1">
                            {task.hasTextInput && (
                              <li>• Text input required</li>
                            )}
                            {task.hasFileUpload && (
                              <li>• File upload required</li>
                            )}
                            <li>• Mark as completed when done</li>
                          </ul>
                          <p className="text-slate-400 text-sm mt-2">
                            <strong>Purpose:</strong> {task.purpose}
                          </p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
          {/* Daily Planner View */}
          {showPlannerView && (
            <DailyPlannerView
              date={date}
              userId={userId}
              onClose={() => setShowPlannerView(false)}
            />
          )}
          {/* Footer */}
          <div className="p-6 border-t border-slate-600 bg-slate-700">
            <div className="flex justify-between items-center">
              <div className="text-slate-300 text-sm">
                Overall Progress: {stats.completed}/{stats.total} tasks
                completed (
                {stats.total > 0
                  ? Math.round((stats.completed / stats.total) * 100)
                  : 0}
                %)
              </div>
              <Button
                onClick={onClose}
                className="bg-slate-600 hover:bg-slate-500"
              >
                Close
              </Button>
            </div>
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
  );
}
