"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import UnifiedHeader from "@/components/UnifiedHeader"
import TaskCard from "@/components/TaskCard"
import { TASKS } from "@/lib/tasks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import DailyPlannerModal from "@/components/DailyPlannerModal"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState(0)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [showPlannerModal, setShowPlannerModal] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    initializePage()
  }, [])

  const initializePage = async () => {
    // Check localStorage first for immediate user data
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("user")
      }
    }

    // Verify authentication and fetch data
    const authValid = await verifyAuthentication()
    if (authValid) {
      await fetchTodaysTasks()
    }

    setAuthChecked(true)
    setLoading(false)
  }

  const verifyAuthentication = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.valid) {
          // Get fresh user data
          const profileResponse = await fetch("/api/user/profile", {
            credentials: "include",
          })

          if (profileResponse.ok) {
            const userData = await profileResponse.json()
            setUser(userData)
            localStorage.setItem("user", JSON.stringify(userData))
            return true
          }
        }
      }

      // Authentication failed
      localStorage.removeItem("user")
      router.push("/login")
      return false
    } catch (error) {
      console.error("Auth verification error:", error)
      // Don't redirect on network errors, let user try again
      return false
    }
  }

  const fetchTodaysTasks = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch(`/api/tasks/daily?date=${today}`, {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
        setCompletedTasks(data.tasks?.filter((task) => task.completed).length || 0)
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("user")
        router.push("/login")
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  const handleTaskUpdate = async (taskId, formData) => {
    try {
      const today = new Date().toISOString().split("T")[0]

      // Create FormData for the request
      const submitData = new FormData()
      submitData.append("taskId", taskId)
      submitData.append("date", today)
      submitData.append("completed", formData.get("completed"))
      submitData.append("textInput", formData.get("textInput") || "")
      submitData.append("notes", formData.get("notes") || "")

      // Add files
      let fileIndex = 0
      while (formData.has(`file_${fileIndex}`)) {
        const file = formData.get(`file_${fileIndex}`)
        if (file && file.size > 0) {
          submitData.append(`file_${fileIndex}`, file)
        }
        fileIndex++
      }

      const response = await fetch("/api/tasks/update", {
        method: "POST",
        body: submitData,
        credentials: "include",
      })

      if (response.ok) {
        await fetchTodaysTasks()
        toast({
          title: "Success",
          description: "Task updated successfully!",
        })
      } else if (response.status === 401) {
        localStorage.removeUser("user")
        router.push("/login")
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to update task",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Task update error:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  // Show loading until auth is checked
  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div>Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  // If no user after auth check, show error
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-red-400 mb-4">Authentication Required</div>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-slate-900">
      <UnifiedHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Today's Dashboard</h1>
          <p className="text-slate-400">{formattedDate}</p>
        </div>

        {/* Quote of the Day */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Quote of the Day</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 italic">"Consistency is the key to success."</p>
          </CardContent>
        </Card>

        {/* Task Progress */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-white">Your Tasks</h2>
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowPlannerModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              📅 Daily Planner
            </Button>
            <div className="text-slate-300">
              {completedTasks} / {TASKS.length} Completed
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="space-y-6">
          {TASKS.map((task) => {
            const userTask = tasks.find((t) => t.taskId === task.id)
            return <TaskCard key={task.id} task={task} userTask={userTask} onUpdate={handleTaskUpdate} />
          })}
        </div>

        {/* Daily Planner Modal */}
        <DailyPlannerModal isOpen={showPlannerModal} onClose={() => setShowPlannerModal(false)} user={user} />
      </main>

      
    </div>
  )
}
