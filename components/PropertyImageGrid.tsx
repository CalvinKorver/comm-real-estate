'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Eye, X } from 'lucide-react'

interface PropertyImageGridProps {
  images?: string[]
}

const DEFAULT_IMAGES = [
  '/p1-1.jpg',
  '/p1-2.jpg',
  '/p1-3.jpg',
  '/p1-4.jpg',
  '/p1-5.jpg',
  '/p1-6.jpg',
]

export function PropertyImageGrid({ images = DEFAULT_IMAGES }: PropertyImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  const handleImageClick = (image: string, index: number) => {
    setSelectedImage(image)
    setSelectedIndex(index)
  }

  const handleClose = () => {
    setSelectedImage(null)
  }

  const handleNext = () => {
    const nextIndex = (selectedIndex + 1) % images.length
    setSelectedIndex(nextIndex)
    setSelectedImage(images[nextIndex])
  }

  const handlePrev = () => {
    const prevIndex = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1
    setSelectedIndex(prevIndex)
    setSelectedImage(images[prevIndex])
  }

  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center mb-8">
        <p className="text-muted-foreground">No images available</p>
      </div>
    )
  }

  return (
    <>
        <div className="grid grid-cols-4 gap-2 mb-8 h-[50vh]">
        {/* Main image - takes up left 2 columns and full height */}
        <div className="col-span-2 relative group cursor-pointer overflow-hidden rounded-lg">
            <Image
            src={images[0]}
            alt="Property main image"
            fill
            className="object-cover transition-transform group-hover:scale-105"
            onClick={() => handleImageClick(images[0], 0)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleImageClick(images[0], 0)}
            >
            <Eye className="h-4 w-4 mr-2" />
            View
            </Button>
        </div>

        {/* Secondary images - right side grid */}
        <div className="col-span-2 grid grid-cols-2 gap-2 h-full">
            {images.slice(1, 5).map((image, index) => (
            <div 
                key={index + 1} 
                className="relative group cursor-pointer overflow-hidden rounded-lg bg-muted"
            >
                <Image
                src={image}
                alt={`Property image ${index + 2}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                onClick={() => handleImageClick(image, index + 1)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                {index === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Button
                    variant="secondary"
                    onClick={() => handleImageClick(image, index + 1)}
                    >
                    +{images.length - 5} photos
                    </Button>
                </div>
                )}
            </div>
            ))}
        </div>
        </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={handleClose}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
                  onClick={handlePrev}
                >
                  ←
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
                  onClick={handleNext}
                >
                  →
                </Button>
              </>
            )}

            {/* Main image */}
            <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
              <Image
                src={selectedImage}
                alt="Property image"
                fill
                className="object-contain"
              />
            </div>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}