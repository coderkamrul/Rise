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

    const notifications = await db
      .collection("notifications")
      .find({ userId: new ObjectId(decoded.userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
