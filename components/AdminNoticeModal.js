"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Trash2, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminNoticeModal({ isOpen, onClose }) {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal",
  })
  const { toast } = useToast()

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
    }
  }

  const handleCreateNotice = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Notice created and notifications sent to all users!",
        })
        setFormData({ title: "", content: "", priority: "normal" })
        setShowCreateForm(false)
        fetchNotices()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to create notice",
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
      setLoading(false)
    }
  }

  const handleDeleteNotice = async (noticeId) => {
    try {
      const response = await fetch(`/api/notices/${noticeId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Notice deleted successfully!",
        })
        fetchNotices()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete notice",
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-6 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Manage Notices</h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Notice
              </Button>
              <Button variant="ghost" onClick={onClose} className="text-white hover:bg-slate-600">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Create Form */}
          {showCreateForm && (
            <Card className="bg-slate-700 border-slate-600 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Create New Notice</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateNotice} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter notice title..."
                      className="bg-slate-600 border-slate-500 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Content</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Enter notice content..."
                      className="bg-slate-600 border-slate-500 text-white"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">📢 Normal</SelectItem>
                        <SelectItem value="important">⚠️ Important</SelectItem>
                        <SelectItem value="urgent">🚨 Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                      {loading ? "Creating..." : "Create Notice"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="border-slate-500 text-white hover:bg-slate-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Notices List */}
          <div className="space-y-4">
            {notices.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-white text-lg font-semibold mb-2">No Notices Created</h3>
                <p className="text-slate-400">Create your first notice to communicate with users!</p>
              </div>
            ) : (
              notices.map((notice) => (
                <Card key={notice._id} className="bg-slate-700 border-slate-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>{notice.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(notice.priority)}>{notice.priority.toUpperCase()}</Badge>
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          {new Date(notice.createdAt).toLocaleDateString()}
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteNotice(notice._id)}
                          className="ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-slate-300 whitespace-pre-wrap">{notice.content}</div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
