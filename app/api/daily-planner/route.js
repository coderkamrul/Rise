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

    if (!date) {
      return NextResponse.json({ message: "Date is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("discipline-tracker")

    const planner = await db.collection("daily-planners").findOne({
      userId: new ObjectId(decoded.userId),
      date: date,
    })

    return NextResponse.json({ planner })
  } catch (error) {
    console.error("Daily planner fetch error:", error)
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

    const plannerData = await request.json()

    if (!plannerData.date || !plannerData.timeSlots) {
      return NextResponse.json({ message: "Date and time slots are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("discipline-tracker")

    const plannerDocument = {
      userId: new ObjectId(decoded.userId),
      name: plannerData.name,
      date: plannerData.date,
      timeSlots: plannerData.timeSlots,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Upsert the daily planner
    await db.collection("daily-planners").updateOne(
      {
        userId: new ObjectId(decoded.userId),
        date: plannerData.date,
      },
      {
        $set: plannerDocument,
      },
      { upsert: true },
    )

    return NextResponse.json({ message: "Daily planner saved successfully" })
  } catch (error) {
    console.error("Daily planner save error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
