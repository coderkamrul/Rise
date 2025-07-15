"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Calendar, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const TIME_SLOTS = [
  "6:00 - 7:00 AM",
  "7:00 - 8:00 AM",
  "8:00 - 9:00 AM",
  "9:00 - 10:00 AM",
  "10:00 - 11:00 AM",
  "11:00 - 12:00 PM",
  "12:00 - 1:00 PM",
  "1:00 - 2:00 PM",
  "2:00 - 3:00 PM",
  "3:00 - 4:00 PM",
  "4:00 - 5:00 PM",
  "5:00 - 6:00 PM",
  "6:00 - 7:00 PM",
  "7:00 - 8:00 PM",
  "8:00 - 9:00 PM",
  "9:00 - 10:00 PM",
  "10:00 - 11:00 PM",
  "11:00 - 11:59 PM",
]

export default function DailyPlannerModal({ isOpen, onClose, user }) {
  const [plannerData, setPlannerData] = useState({
    name: user?.name || "",
    date: new Date().toISOString().split("T")[0],
    timeSlots: TIME_SLOTS.map((time) => ({
      time,
      task: "",
      notes: "",
      completed: false,
    })),
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchExistingPlanner()
    }
  }, [isOpen, plannerData.date])

  const fetchExistingPlanner = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/daily-planner?date=${plannerData.date}`)

      if (response.ok) {
        const data = await response.json()
        if (data.planner) {
          setPlannerData({
            ...plannerData,
            timeSlots: data.planner.timeSlots || plannerData.timeSlots,
          })
        }
      }
    } catch (error) {
      console.error("Error fetching planner:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTimeSlotChange = (index, field, value) => {
    const updatedTimeSlots = [...plannerData.timeSlots]
    updatedTimeSlots[index] = {
      ...updatedTimeSlots[index],
      [field]: value,
    }
    setPlannerData({
      ...plannerData,
      timeSlots: updatedTimeSlots,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/daily-planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(plannerData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Daily planner saved successfully!",
        })
        onClose()
      } else {
        toast({
          title: "Error",
          description: "Failed to save daily planner",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDateChange = (newDate) => {
    setPlannerData({
      ...plannerData,
      date: newDate,
      timeSlots: TIME_SLOTS.map((time) => ({
        time,
        task: "",
        notes: "",
        completed: false,
      })),
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 relative pt-8 flex-wrap text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">DAILY PLANNER</h2>
            <div className="flex flex-wrap items-center gap-4 ml-8">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm">NAME:</span>
                <Input
                  value={plannerData.name}
                  onChange={(e) => setPlannerData({ ...plannerData, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white w-32"
                  size="sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">DATE:</span>
                <Input
                  type="date"
                  value={plannerData.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white w-36"
                  size="sm"
                />
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute top-1 right-1 md:top-8 md:right-4 text-white hover:bg-slate-700">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 bg-black overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-600">Loading planner...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 mb-2 font-semibold text-slate-700 border-b-2 border-slate-300 pb-2">
                <div className="col-span-3 text-center bg-slate-800 text-white py-2 rounded">Time</div>
                <div className="col-span-4 text-center bg-slate-800 text-white py-2 rounded">Task/Activity</div>
                <div className="col-span-4 text-center bg-slate-800 text-white py-2 rounded">Notes</div>
                <div className="col-span-1 text-center bg-slate-800 text-white py-2 rounded">✓</div>
              </div>

              {/* Time Slots */}
              <div className="space-y-1 ">
                {plannerData.timeSlots.map((slot, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center py-1 hover:bg-slate-50 rounded">
                    <div className="col-span-3">
                      <div className="bg-slate-100 border border-slate-300 p-2 text-black text-sm font-medium text-center rounded">
                        {slot.time}
                      </div>
                    </div>
                    <div className="col-span-4">
                      <Input
                        value={slot.task}
                        onChange={(e) => handleTimeSlotChange(index, "task", e.target.value)}
                        placeholder="Enter task or activity"
                        className="border-slate-300 text-sm"
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        value={slot.notes}
                        onChange={(e) => handleTimeSlotChange(index, "notes", e.target.value)}
                        placeholder="Add notes"
                        className="border-slate-300 text-sm"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <input
                        type="checkbox"
                        checked={slot.completed}
                        onChange={(e) => handleTimeSlotChange(index, "completed", e.target.checked)}
                        className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-8" disabled={saving}>
                  {saving ? "Saving..." : "Save Planner"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
