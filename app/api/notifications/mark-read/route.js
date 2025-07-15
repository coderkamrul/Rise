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

    const { notificationId } = await request.json()

    const client = await clientPromise
    const db = client.db("discipline-tracker")

    await db.collection("notifications").updateOne(
      {
        _id: new ObjectId(notificationId),
        userId: new ObjectId(decoded.userId),
      },
      { $set: { read: true } },
    )

    return NextResponse.json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Mark notification read error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
