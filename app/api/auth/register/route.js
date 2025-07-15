import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("discipline-tracker")

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      role: "user",
      profilePicture: null,
      createdAt: new Date(),
      stats: {
        totalDays: 0,
        successRate: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
    })

    return NextResponse.json({ message: "User created successfully", userId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
