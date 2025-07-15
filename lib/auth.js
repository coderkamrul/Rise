import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 12)
  } catch (error) {
    console.error("Password hashing error:", error)
    throw new Error("Failed to hash password")
  }
}

export const verifyPassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}

export const generateToken = (userId) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables")
    }
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
  } catch (error) {
    console.error("Token generation error:", error)
    throw new Error("Failed to generate token")
  }
}

export const verifyToken = (token) => {
  try {
    if (!token) {
      return null
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables")
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Token has expired")
    } else if (error.name === "JsonWebTokenError") {
      console.log("Invalid token format")
    } else {
      console.error("Token verification error:", error.message)
    }
    return null
  }
}
