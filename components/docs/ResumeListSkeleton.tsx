// components/ResumeSkeleton.tsx

import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from 'lucide-react'

const SkeletonResumeCard = () => (
  <div className="bg-white p-4 rounded-lg shadow-md">
    <div className="aspect-[1/1.414] w-full mb-4 relative overflow-hidden">
      <Skeleton className="absolute inset-0" />
    </div>
    <Skeleton className="h-5 w-3/4 mb-2" />
    <Skeleton className="h-4 w-1/2" />
  </div>
)

export const ResumeSkeleton = () => (
  <div className="grid grid-cols-7 gap-6">
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
      <Plus className="w-12 h-12 text-gray-400 mb-2" />
      <Skeleton className="h-5 w-32" />
    </div>
    {[...Array(13)].map((_, index) => (
      <SkeletonResumeCard key={index} />
    ))}
  </div>
)