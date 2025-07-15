"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

export default function ImageViewerModal({ images, currentIndex, onClose, onDelete, canDelete = false }) {
  const [activeIndex, setActiveIndex] = useState(currentIndex || 0)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!images || images.length === 0) return null

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setConfirmDelete(false)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setConfirmDelete(false)
  }

  const handleDelete = () => {
    if (confirmDelete && onDelete) {
      onDelete(activeIndex)
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
    }
  }

  const cancelDelete = () => {
    setConfirmDelete(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[999] p-4">
      <div className="relative max-w-5xl max-h-[95vh] w-full">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-70 p-4 flex items-center justify-between z-10 rounded-t-lg">
          <div className="text-white font-medium">
            {activeIndex + 1} of {images.length}
          </div>
          <div className="flex items-center gap-2">
            {canDelete && (
              <div className="flex items-center gap-2">
                {confirmDelete ? (
                  <>
                    <span className="text-red-400 text-sm">Confirm delete?</span>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                      Yes, Delete
                    </Button>
                    <Button variant="outline" size="sm" onClick={cancelDelete}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="destructive" size="sm" onClick={handleDelete} className="flex items-center gap-1">
                    <Trash2 className="w-4 h-4" />
                    Delete Image
                  </Button>
                )}
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex items-center justify-center h-full bg-black rounded-lg overflow-hidden">
          <img
            src={images[activeIndex] || "/placeholder.svg"}
            alt={`Image ${activeIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: "calc(95vh - 120px)" }}
          />
        </div>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black bg-opacity-70 p-3 rounded-lg max-w-full overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveIndex(index)
                  setConfirmDelete(false)
                }}
                className={`flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition-all ${
                  index === activeIndex ? "border-white scale-110" : "border-transparent hover:border-gray-400"
                }`}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
