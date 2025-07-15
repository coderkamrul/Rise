import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { uploadToCloudinary } from "@/lib/cloudinary"
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

    const formData = await request.formData()
    const name = formData.get("name")
    const profilePicture = formData.get("profilePicture")

    const updateData = { name }

    // Upload profile picture if provided
    if (profilePicture && profilePicture.size > 0) {
      const bytes = await profilePicture.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = `data:${profilePicture.type};base64,${buffer.toString("base64")}`

      const uploadResult = await uploadToCloudinary(base64, "profile-pictures")
      updateData.profilePicture = uploadResult.secure_url
    }

    const client = await clientPromise
    const db = client.db("discipline-tracker")

    await db.collection("users").updateOne({ _id: new ObjectId(decoded.userId) }, { $set: updateData })

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
