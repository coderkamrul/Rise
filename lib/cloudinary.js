import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadToCloudinary = async (file, folder = "discipline-tracker") => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "auto",
    })
    return result
  } catch (error) {
    throw new Error("Failed to upload to Cloudinary")
  }
}

export default cloudinary
