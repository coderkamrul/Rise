"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import TaskModal from "./TaskModal"

export default function Calendar({ userId, onDateClick, isAdmin = false }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [taskData, setTaskData] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)
  const [showTaskModal, setShowTaskModal] = useState(false)

  useEffect(() => {
    fetchMonthData()
  }, [currentDate, userId])

  const fetchMonthData = async () => {
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const response = await fetch(`/api/tasks/month?year=${year}&month=${month}&userId=${userId}`)

      if (response.ok) {
        const data = await response.json()
        setTaskData(data.taskData || {})
      }
    } catch (error) {
      console.error("Error fetching month data:", error)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const isDateClickable = (day) => {
    if (!day) return false

    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const today = new Date().toISOString().split("T")[0]

    // For admin, all dates with data are clickable
    if (isAdmin) {
      return taskData[dateStr] && taskData[dateStr].totalTasks > 0
    }

    // For regular users, clickable if it's today or in the past and has task data
    return dateStr <= today && taskData[dateStr]
  }

  const getDateStatus = (day) => {
    if (!day) return ""

    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const today = new Date().toISOString().split("T")[0]
    const dayData = taskData[dateStr]

    if (dateStr === today) {
      // For today, check if it's 100% completed
      if (dayData && dayData.totalTasks > 0) {
        const completionRate = dayData.completedTasks / dayData.totalTasks
        if (completionRate === 1) {
          return "completed" // Green for 100% completion even if it's today
        }
      }
      return "active" // Red for today if not 100% complete
    } else if (dayData && dayData.completedTasks > 0) {
      // Show different colors based on completion rate for past days
      const completionRate = dayData.completedTasks / dayData.totalTasks
      if (completionRate >= 0.8) {
        return "completed" // Green for 80%+ completion
      } else if (completionRate >= 0.5) {
        return "partial" // Yellow for 50-79% completion
      } else {
        return "low" // Red for <50% completion
      }
    } else if (dateStr > today) {
      return "disabled"
    }

    return ""
  }

  const handleDateClick = (day) => {
    if (!isDateClickable(day)) return

    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

    if (isAdmin && onDateClick) {
      onDateClick(dateStr)
    } else {
      setSelectedDate(dateStr)
      setShowTaskModal(true)
    }
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const days = getDaysInMonth(currentDate)
  const monthYear = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"]

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)} className="text-white">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-xl font-semibold text-white">{monthYear}</h3>
        <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)} className="text-white">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-slate-400 font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dateStr = day
            ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            : null
          const dayData = dateStr ? taskData[dateStr] : null

          return (
            <div
              key={index}
              className={`calendar-day ${getDateStatus(day)} ${
                isDateClickable(day) ? "cursor-pointer" : "cursor-not-allowed"
              } relative`}
              onClick={() => handleDateClick(day)}
              title={dayData ? `${dayData.completedTasks}/${dayData.totalTasks} tasks completed` : ""}
            >
              {day}
              {dayData && dayData.totalTasks > 0 && (
                <div className="absolute -bottom-1 -right-1 text-xs bg-slate-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {dayData.completedTasks}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Task Modal for regular users */}
      {showTaskModal && selectedDate && !isAdmin && (
        <TaskModal date={selectedDate} userId={userId} onClose={() => setShowTaskModal(false)} />
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span>Today (incomplete)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span>100% completion</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          <span>Partial completion (50-79%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded-full"></div>
          <span>Low completion (&lt;50%)</span>
        </div>
      </div>
    </div>
  )
}
