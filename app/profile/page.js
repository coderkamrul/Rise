"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import UnifiedHeader from "@/components/UnifiedHeader"
import Calendar from "@/components/Calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalDays: 0,
    successRate: 0,
    currentStreak: 0,
    longestStreak: 0,
  })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    profilePicture: null,
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchUserData()
    fetchUserStats()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setEditForm({
          name: userData.name,
          profilePicture: null,
        })
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      router.push("/login")
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch("/api/user/stats")
      if (response.ok) {
        const statsData = await response.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()

    try {
      const formData = new FormData()
      formData.append("name", editForm.name)
      if (editForm.profilePicture) {
        formData.append("profilePicture", editForm.profilePicture)
      }

      const response = await fetch("/api/user/update", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        await fetchUserData()
        setEditing(false)
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile",
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
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture || "/placeholder.svg"}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
            <p className="text-slate-400">Keep up the great work!</p>
          </div>
          <Button onClick={() => setEditing(!editing)} variant="outline" className="ml-auto">
            {editing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        {/* Edit Profile Form */}
        {editing && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profilePicture" className="text-white">
                    Profile Picture
                  </Label>
                  <Input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditForm({ ...editForm, profilePicture: e.target.files[0] })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button type="submit" className="bg-red-500 hover:bg-red-600">
                  Update Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">📅</div>
                <div>
                  <div className="text-sm text-slate-400">Total Days</div>
                  <div className="text-2xl font-bold text-white">{stats.totalDays}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">📊</div>
                <div>
                  <div className="text-sm text-slate-400">Success Rate</div>
                  <div className="text-2xl font-bold text-white">{stats.successRate}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">🔥</div>
                <div>
                  <div className="text-sm text-slate-400">Current Streak</div>
                  <div className="text-2xl font-bold text-white">{stats.currentStreak}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">🏆</div>
                <div>
                  <div className="text-sm text-slate-400">Longest Streak</div>
                  <div className="text-2xl font-bold text-white">{stats.longestStreak}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Your Progress Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar userId={user?._id} />
          </CardContent>
        </Card>
      </main>

      
    </div>
  )
}
