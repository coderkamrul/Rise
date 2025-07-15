import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    // Verify token
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("discipline-tracker")

    // Find user
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.userId) }, { projection: { password: 0 } })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
