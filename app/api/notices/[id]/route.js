import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function DELETE(request, { params }) {
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

    const { id } = params

    await db
      .collection("notices")
      .updateOne({ _id: new ObjectId(id) }, { $set: { active: false, deletedAt: new Date() } })

    return NextResponse.json({ message: "Notice deleted successfully" })
  } catch (error) {
    console.error("Notice deletion error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
