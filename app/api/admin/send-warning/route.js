import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const { userId, taskId, date } = await request.json()

    const client = await clientPromise
    const db = client.db("discipline-tracker")

    // Create notification
    await db.collection("notifications").insertOne({
      userId: new ObjectId(userId),
      type: "warning",
      message: `Warning: You have not completed the ${taskId} task for ${date}. Please complete it to maintain your streak.`,
      read: false,
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "Warning sent successfully" })
  } catch (error) {
    console.error("Send warning error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
