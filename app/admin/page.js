"use client"

import { useState, useEffect } from "react"
import UnifiedHeader from "@/components/UnifiedHeader"
import AdminUserModal from "@/components/AdminUserModal"
import AdminNoticeModal from "@/components/AdminNoticeModal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Trash2, UserCog, Bell } from "lucide-react"

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showNoticeModal, setShowNoticeModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${userName} deleted successfully!`,
        })
        fetchUsers()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to delete user",
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

  const handleRoleChange = async (userId, newRole, userName) => {
    if (!confirm(`Are you sure you want to change ${userName}'s role to ${newRole}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `${userName}'s role updated to ${newRole}!`,
        })
        fetchUsers()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to update role",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <UnifiedHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <Button
            onClick={() => setShowNoticeModal(true)}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Manage Notices
          </Button>
        </div>

        {users.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-semibold text-white mb-4">No User Data Found</h2>
              <p className="text-slate-400">As users join and complete tasks, their data will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">All Users ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-white">User</th>
                      <th className="text-left py-3 px-4 text-white">Email</th>
                      <th className="text-left py-3 px-4 text-white">Stats</th>
                      <th className="text-left py-3 px-4 text-white">Role</th>
                      <th className="text-left py-3 px-4 text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                              {user.profilePicture ? (
                                <img
                                  src={user.profilePicture || "/placeholder.svg"}
                                  alt={user.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold text-sm">
                                  {user.name?.charAt(0)?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="text-slate-300 font-medium">{user.name}</div>
                              <div className="text-slate-500 text-sm">
                                Joined {new Date(user.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{user.email}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="text-slate-300 text-sm">
                              {user.stats?.totalDays || 0} days • {user.stats?.successRate || 0}% success
                            </div>
                            <div className="text-slate-400 text-xs">
                              Current: {user.stats?.currentStreak || 0} • Best: {user.stats?.longestStreak || 0}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Select
                            value={user.role || "user"}
                            onValueChange={(newRole) => handleRoleChange(user._id, newRole, user.name)}
                          >
                            <SelectTrigger className="w-24 bg-slate-700 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUser(user)}
                              className="text-slate-300 border-slate-600 hover:bg-slate-700"
                            >
                              <UserCog className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteUser(user._id, user.name)}
                              className="hover:bg-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Details Modal */}
        {selectedUser && <AdminUserModal user={selectedUser} onClose={() => setSelectedUser(null)} />}

        {/* Notice Management Modal */}
        <AdminNoticeModal isOpen={showNoticeModal} onClose={() => setShowNoticeModal(false)} />
      </main>
    </div>
  )
}
