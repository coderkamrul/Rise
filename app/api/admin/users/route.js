import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

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

    // Get all users with their recent tasks
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray()

    // Get recent tasks for each user
    for (const user of users) {
      const recentTasks = await db.collection("tasks").find({ userId: user._id }).sort({ date: -1 }).limit(10).toArray()

      user.recentTasks = recentTasks
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
