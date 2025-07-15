import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("discipline-tracker")

    // Get all users and sort by success rate and current streak
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray()

    // Calculate and update stats for each user
    for (const user of users) {
      const tasks = await db
        .collection("tasks")
        .find({
          userId: user._id,
        })
        .toArray()

      const totalDays = new Set(tasks.map((task) => task.date)).size
      const completedTasks = tasks.filter((task) => task.completed).length
      const successRate = totalDays > 0 ? Math.round((completedTasks / (totalDays * 8)) * 100) : 0

      // Calculate current streak
      const dates = [...new Set(tasks.map((task) => task.date))].sort()
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0

      for (let i = dates.length - 1; i >= 0; i--) {
        const date = dates[i]
        const dayTasks = tasks.filter((task) => task.date === date)
        const completedCount = dayTasks.filter((task) => task.completed).length

        if (completedCount >= 4) {
          tempStreak++
          if (i === dates.length - 1) {
            currentStreak = tempStreak
          }
        } else {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak
          }
          tempStreak = 0
        }
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }

      user.stats = {
        totalDays,
        successRate,
        currentStreak,
        longestStreak,
      }
    }

    // Sort by success rate, then by current streak, then by longest streak
    const leaderboard = users.sort((a, b) => {
      if (b.stats.successRate !== a.stats.successRate) {
        return b.stats.successRate - a.stats.successRate
      }
      if (b.stats.currentStreak !== a.stats.currentStreak) {
        return b.stats.currentStreak - a.stats.currentStreak
      }
      return b.stats.longestStreak - a.stats.longestStreak
    })

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("Leaderboard fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
