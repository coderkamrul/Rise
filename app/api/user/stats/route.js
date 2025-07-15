import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("discipline-tracker")

    // Get user's task history
    const tasks = await db
      .collection("tasks")
      .find({
        userId: new ObjectId(decoded.userId),
      })
      .toArray()

    // Calculate stats
    const totalDays = new Set(tasks.map((task) => task.date)).size
    const completedTasks = tasks.filter((task) => task.completed).length
    const successRate = totalDays > 0 ? Math.round((completedTasks / (totalDays * 8)) * 100) : 0

    // Calculate streaks
    const dates = [...new Set(tasks.map((task) => task.date))].sort()
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    const today = new Date().toISOString().split("T")[0]

    for (let i = dates.length - 1; i >= 0; i--) {
      const date = dates[i]
      const dayTasks = tasks.filter((task) => task.date === date)
      const completedCount = dayTasks.filter((task) => task.completed).length

      if (completedCount >= 4) {
        // At least half tasks completed
        tempStreak++
        if (date === today || i === dates.length - 1) {
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

    const stats = {
      totalDays,
      successRate,
      currentStreak,
      longestStreak,
    }

    // Update user stats in database
    await db.collection("users").updateOne({ _id: new ObjectId(decoded.userId) }, { $set: { stats } })

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Stats fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
