"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AdminCalendar from "@/components/Calendar"
import AdminTaskModal from "./AdminTaskModal"

export default function AdminUserModal({ user, onClose }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const { toast } = useToast()

  const sendWarning = async (userId, taskId, date) => {
    try {
      const response = await fetch("/api/admin/send-warning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, taskId, date }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Warning sent successfully!",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to send warning",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isToday = (dateStr) => {
    const today = new Date().toISOString().split("T")[0]
    return dateStr === today
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-6 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture || "/placeholder.svg"}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-xl font-bold">{user.name?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-slate-300">{user.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline" className="text-slate-300 border-slate-500">
                    {user.role || "user"}
                  </Badge>
                  <span className="text-slate-400 text-sm">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-white hover:bg-slate-600">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Stats and Recent Tasks */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                        <X className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Total Days</div>
                        <div className="text-2xl font-bold text-white">{user.stats?.totalDays || 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Success Rate</div>
                        <div className="text-2xl font-bold text-white">{user.stats?.successRate || 0}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">🔥</div>
                      <div>
                        <div className="text-sm text-slate-400">Current Streak</div>
                        <div className="text-2xl font-bold text-white">{user.stats?.currentStreak || 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">🏆</div>
                      <div>
                        <div className="text-sm text-slate-400">Best Streak</div>
                        <div className="text-2xl font-bold text-white">{user.stats?.longestStreak || 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Tasks */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Recent Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {user.recentTasks && user.recentTasks.length > 0 ? (
                      user.recentTasks.slice(0, 10).map((task, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {task.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className="text-slate-300 font-medium">{task.taskId}</span>
                            </div>
                            <span className="text-slate-400 text-sm">{formatDate(task.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={task.completed ? "default" : "destructive"}>
                              {task.completed ? "Completed" : "Incomplete"}
                            </Badge>
                            {!task.completed && isToday(task.date) && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => sendWarning(user._id, task.taskId, task.date)}
                              >
                                Send Warning
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-4">No recent tasks found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Calendar */}
            <div>
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Progress Calendar</CardTitle>
                  <p className="text-slate-400 text-sm">Click on any date to view detailed task information</p>
                </CardHeader>
                <CardContent>
                  <AdminCalendar
                    userId={user._id}
                    onDateClick={(date) => {
                      setSelectedDate(date)
                      setShowTaskModal(true)
                    }}
                    isAdmin={true}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Task Modal */}
        {showTaskModal && selectedDate && (
          <AdminTaskModal
            date={selectedDate}
            userId={user._id}
            userName={user.name}
            onClose={() => setShowTaskModal(false)}
            onSendWarning={sendWarning}
          />
        )}
      </div>
    </div>
  )
}
