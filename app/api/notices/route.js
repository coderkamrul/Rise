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

    const notices = await db.collection("notices").find({ active: true }).sort({ createdAt: -1 }).limit(50).toArray()

    return NextResponse.json({ notices })
  } catch (error) {
    console.error("Notices fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

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

    const client = await clientPromise
    const db = client.db("discipline-tracker")

    // Check if user is admin
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    const { title, content, priority } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ message: "Title and content are required" }, { status: 400 })
    }

    const notice = {
      title,
      content,
      priority: priority || "normal", // normal, important, urgent
      createdBy: new ObjectId(decoded.userId),
      createdAt: new Date(),
      active: true,
    }

    const result = await db.collection("notices").insertOne(notice)

    // Create notifications for all users
    const users = await db
      .collection("users")
      .find({}, { projection: { _id: 1 } })
      .toArray()

    const notifications = users.map((user) => ({
      userId: user._id,
      type: "notice",
      title: "New Notice",
      message: `📢 ${title}`,
      read: false,
      createdAt: new Date(),
      noticeId: result.insertedId,
    }))

    if (notifications.length > 0) {
      await db.collection("notifications").insertMany(notifications)
    }

    return NextResponse.json({ message: "Notice created successfully", noticeId: result.insertedId })
  } catch (error) {
    console.error("Notice creation error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
