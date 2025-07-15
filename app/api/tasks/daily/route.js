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
    const date = searchParams.get("date")
    const userId = searchParams.get("userId") || decoded.userId

    if (!date) {
      return NextResponse.json({ message: "Date is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("discipline-tracker")

    const tasks = await db
      .collection("tasks")
      .find({
        userId: new ObjectId(userId),
        date: date,
      })
      .toArray()

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Daily tasks fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
