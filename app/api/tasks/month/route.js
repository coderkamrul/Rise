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

    const { searchParams } = new URL(request.url)
    const year = Number.parseInt(searchParams.get("year"))
    const month = Number.parseInt(searchParams.get("month"))
    const userId = searchParams.get("userId") || decoded.userId

    if (!year || !month) {
      return NextResponse.json({ message: "Year and month are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("discipline-tracker")

    // Get tasks for the month
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`
    const endDate = `${year}-${String(month).padStart(2, "0")}-31`

    const tasks = await db
      .collection("tasks")
      .find({
        userId: new ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      })
      .toArray()

    // Group tasks by date
    const taskData = {}
    tasks.forEach((task) => {
      if (!taskData[task.date]) {
        taskData[task.date] = {
          totalTasks: 0,
          completedTasks: 0,
          tasks: [],
        }
      }
      taskData[task.date].totalTasks++
      if (task.completed) {
        taskData[task.date].completedTasks++
      }
      taskData[task.date].tasks.push(task)
    })

    return NextResponse.json({ taskData })
  } catch (error) {
    console.error("Month tasks fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
