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
    const taskId = formData.get("taskId")
    const date = formData.get("date")
    const completed = formData.get("completed") === "true"
    const textInput = formData.get("textInput") || ""
    const notes = formData.get("notes") || ""
    const removeImageIndex = formData.get("removeImageIndex")
    const action = formData.get("action") || "updateTask"

    const client = await clientPromise
    const db = client.db("discipline-tracker")

    // Get existing task to handle image operations
    const existingTask = await db.collection("tasks").findOne({
      userId: new ObjectId(decoded.userId),
      taskId,
      date,
    })

    let files = existingTask?.files || []

    // Handle image deletion
    if (action === "deleteImage" && removeImageIndex !== null && removeImageIndex !== undefined) {
      const indexToRemove = Number.parseInt(removeImageIndex)
      if (indexToRemove >= 0 && indexToRemove < files.length) {
        files.splice(indexToRemove, 1)
        console.log(`Removed image at index ${indexToRemove}, remaining files:`, files.length)
      }
    } else if (action === "updateTask" || action === "updateCompletion") {
      // Handle new file uploads
      if (taskId === "hydration") {
        // Handle hydration task files separately
        const newFiles = []

        // Process full bottle files first
        let fullBottleIndex = 0
        while (formData.has(`full_bottle_${fullBottleIndex}`)) {
          const file = formData.get(`full_bottle_${fullBottleIndex}`)
          if (file && file.size > 0) {
            try {
              const bytes = await file.arrayBuffer()
              const buffer = Buffer.from(bytes)
              const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

              const uploadResult = await uploadToCloudinary(base64, "task-files/hydration/full")
              newFiles.push(uploadResult.secure_url)
            } catch (uploadError) {
              console.error("Full bottle file upload error:", uploadError)
            }
          }
          fullBottleIndex++
        }

        // Process empty bottle files
        let emptyBottleIndex = 0
        while (formData.has(`empty_bottle_${emptyBottleIndex}`)) {
          const file = formData.get(`empty_bottle_${emptyBottleIndex}`)
          if (file && file.size > 0) {
            try {
              const bytes = await file.arrayBuffer()
              const buffer = Buffer.from(bytes)
              const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

              const uploadResult = await uploadToCloudinary(base64, "task-files/hydration/empty")
              newFiles.push(uploadResult.secure_url)
            } catch (uploadError) {
              console.error("Empty bottle file upload error:", uploadError)
            }
          }
          emptyBottleIndex++
        }

        // Add new files to existing files
        files = [...files, ...newFiles]
      } else {
        // Handle regular file uploads for other tasks - use new_file_ prefix to avoid duplicates
        let fileIndex = 0
        while (formData.has(`new_file_${fileIndex}`)) {
          const file = formData.get(`new_file_${fileIndex}`)
          if (file && file.size > 0) {
            try {
              const bytes = await file.arrayBuffer()
              const buffer = Buffer.from(bytes)
              const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

              const uploadResult = await uploadToCloudinary(base64, "task-files")
              files.push(uploadResult.secure_url)
            } catch (uploadError) {
              console.error("File upload error:", uploadError)
            }
          }
          fileIndex++
        }
      }
    }

    const taskData = {
      userId: new ObjectId(decoded.userId),
      taskId,
      date,
      completed,
      textInput,
      notes,
      files,
      updatedAt: new Date(),
    }

    // Upsert task
    const result = await db
      .collection("tasks")
      .updateOne({ userId: new ObjectId(decoded.userId), taskId, date }, { $set: taskData }, { upsert: true })

    console.log(`Task ${taskId} updated successfully. Action: ${action}, Files count: ${files.length}`)

    return NextResponse.json({
      message: "Task updated successfully",
      filesCount: files.length,
      action: action,
    })
  } catch (error) {
    console.error("Task update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
