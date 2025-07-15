"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, X } from "lucide-react"

export default function NoticeBoard({ isOpen, onClose }) {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchNotices()
    }
  }, [isOpen])

  const fetchNotices = async () => {
    try {
      const response = await fetch("/api/notices")
      if (response.ok) {
        const data = await response.json()
        setNotices(data.notices || [])
      }
    } catch (error) {
      console.error("Error fetching notices:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white"
      case "important":
        return "bg-orange-500 text-white"
      default:
        return "bg-blue-500 text-white"
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "urgent":
        return "🚨"
      case "important":
        return "⚠️"
      default:
        return "📢"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-6 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Notice Board</h2>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-white hover:bg-slate-600">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-white">Loading notices...</div>
            </div>
          ) : notices.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">No Notices Yet</h3>
              <p className="text-slate-400">Check back later for important announcements!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notices.map((notice) => (
                <Card key={notice._id} className="bg-slate-700 border-slate-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getPriorityIcon(notice.priority)}</span>
                        <span>{notice.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(notice.priority)}>{notice.priority.toUpperCase()}</Badge>
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          {new Date(notice.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-slate-300 whitespace-pre-wrap">{notice.content}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-600 bg-slate-700">
          <div className="flex justify-between items-center">
            <div className="text-slate-300 text-sm">
              {notices.length} notice{notices.length !== 1 ? "s" : ""} available
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
