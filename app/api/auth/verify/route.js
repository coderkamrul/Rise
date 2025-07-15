import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ valid: false, message: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ valid: false, message: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({
      valid: true,
      userId: decoded.userId,
      message: "Token is valid",
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json(
      {
        valid: false,
        message: "Token verification failed",
      },
      { status: 401 },
    )
  }
}
