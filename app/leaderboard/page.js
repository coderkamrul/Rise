"use client"

import { useState, useEffect } from "react"
import UnifiedHeader from "@/components/UnifiedHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard")
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.leaderboard)
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🥇"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return `#${rank}`
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Leaderboard</h1>
          <p className="text-slate-400">See how you rank against other discipline warriors</p>
        </div>

        <Card className="bg-slate-800 border-slate-700 rounded-lg">
          <CardHeader>
            <CardTitle className="text-white">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">
                  No data available yet. Start completing tasks to appear on the leaderboard!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((user, index) => (
                  <div
                    key={user._id}
                    className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-lg ${
                      index < 3 ? "bg-gradient-to-r from-yellow-900/20 to-yellow-800/20" : "bg-slate-700"
                    }`}
                  >
                    {/* User Info Section - Adapts to screen size */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="text-2xl font-bold text-white min-w-[3rem] text-center">{getRankIcon(index + 1)}</div>
                      <div className="flex items-center gap-3 flex-grow">
                        <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center overflow-hidden">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture || "/placeholder.svg"}
                              alt={user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-xl">{user.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{user.name}</h3>
                          <p className="text-slate-400 text-sm">{user.stats.totalDays} days active</p>
                        </div>
                      </div>
                    </div>

                    {/* Spacer for mobile view, hidden on medium screens and up */}
                    <hr className="w-full border-slate-600 my-4 md:hidden" />

                    {/* Stats Section - Adapts for mobile */}
                    <div className="flex items-center justify-around md:justify-end gap-4 sm:gap-6 w-full md:w-auto">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-green-400">{user.stats.successRate}%</div>
                        <div className="text-xs text-slate-400">Success Rate</div>
                      </div>

                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-orange-400">{user.stats.currentStreak}</div>
                        <div className="text-xs text-slate-400">Current Streak</div>
                      </div>

                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-yellow-400">{user.stats.longestStreak}</div>
                        <div className="text-xs text-slate-400">Best Streak</div>
                      </div>

                      {index < 3 && (
                        <div className="hidden sm:block">
                           <Badge variant="secondary" className="bg-yellow-600 text-white px-2">
                             Top {index + 1}
                           </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      
    </div>
  )
}
