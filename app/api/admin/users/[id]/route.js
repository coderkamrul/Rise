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
    const adminUser = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    const { id } = params

    // Don't allow admin to delete themselves
    if (id === decoded.userId) {
      return NextResponse.json({ message: "Cannot delete your own account" }, { status: 400 })
    }

    // Delete user and all related data
    await db.collection("users").deleteOne({ _id: new ObjectId(id) })
    await db.collection("tasks").deleteMany({ userId: new ObjectId(id) })
    await db.collection("notifications").deleteMany({ userId: new ObjectId(id) })
    await db.collection("daily-planners").deleteMany({ userId: new ObjectId(id) })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("User deletion error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
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
    const adminUser = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    const { id } = params
    const { role } = await request.json()

    if (!role || !["user", "admin"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 })
    }

    // Don't allow admin to change their own role
    if (id === decoded.userId) {
      return NextResponse.json({ message: "Cannot change your own role" }, { status: 400 })
    }

    await db.collection("users").updateOne({ _id: new ObjectId(id) }, { $set: { role, updatedAt: new Date() } })

    return NextResponse.json({ message: "User role updated successfully" })
  } catch (error) {
    console.error("User role update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
