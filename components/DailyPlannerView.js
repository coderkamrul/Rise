"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CheckCircle, Circle } from "lucide-react"

export default function DailyPlannerView({ date, userId, onClose }) {
  const [planner, setPlanner] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlanner()
  }, [date, userId])

  const fetchPlanner = async () => {
    try {
      const response = await fetch(`/api/daily-planner?date=${date}&userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setPlanner(data.planner)
      }
    } catch (error) {
      console.error("Error fetching planner:", error)
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

  const getCompletionStats = () => {
    if (!planner?.timeSlots) return { completed: 0, total: 0 }

    const completed = planner.timeSlots.filter((slot) => slot.completed && slot.task.trim()).length
    const total = planner.timeSlots.filter((slot) => slot.task.trim()).length

    return { completed, total }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="text-white">Loading planner...</div>
        </div>
      </div>
    )
  }

  if (!planner) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-800 border-slate-700 max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">No Planner Found</h3>
            <p className="text-slate-400 mb-4">No daily planner was created for {formatDate(date)}.</p>
            <Button onClick={onClose}>Close</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = getCompletionStats()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-6 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Daily Planner - {formatDate(date)}</h2>
              <div className="flex items-center gap-4 text-slate-300">
                <span>👤 {planner.name}</span>
                <Badge variant="outline" className="text-slate-300 border-slate-500">
                  {stats.completed}/{stats.total} Tasks Completed
                </Badge>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-white hover:bg-slate-600">
              ✕
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-2">
            {planner.timeSlots.map((slot, index) => (
              <div
                key={index}
                className={`grid grid-cols-12 gap-4 p-3 rounded-lg border ${
                  slot.task.trim()
                    ? slot.completed
                      ? "bg-green-900/20 border-green-700"
                      : "bg-slate-700 border-slate-600"
                    : "bg-slate-800/50 border-slate-700"
                }`}
              >
                <div className="col-span-3 flex items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300 font-medium text-sm">{slot.time}</span>
                  </div>
                </div>

                <div className="col-span-4 flex items-center">
                  {slot.task.trim() ? (
                    <span className={`text-sm ${slot.completed ? "text-green-300" : "text-white"}`}>{slot.task}</span>
                  ) : (
                    <span className="text-slate-500 text-sm italic">No task planned</span>
                  )}
                </div>

                <div className="col-span-4 flex items-center">
                  {slot.notes.trim() ? (
                    <span className="text-slate-300 text-sm">{slot.notes}</span>
                  ) : (
                    <span className="text-slate-500 text-sm italic">No notes</span>
                  )}
                </div>

                <div className="col-span-1 flex items-center justify-center">
                  {slot.task.trim() &&
                    (slot.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-600 bg-slate-700">
          <div className="flex justify-between items-center">
            <div className="text-slate-300 text-sm">
              Completion Rate: {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
            <Button onClick={onClose} className="bg-slate-600 hover:bg-slate-500">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
