// components/ResumeSkeleton.tsx

import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Plus } from 'lucide-react'

const SkeletonResumeCard = () => (
  <div className="w-[200px] h-[300px] m-2 relative group">
    <div className="bg-white text-center p-3 rounded-lg shadow-md group-hover:shadow-xl hover:bg-[#EDF4FF] transition-all duration-300 h-full">
      <Skeleton className="h-[30px] w-3/4 mb-2" />
      <div className="aspect-[1/1.414] w-full h-[230px] relative overflow-hidden">
        <Skeleton className="absolute inset-0 rounded-lg" />
      </div>
      <div className="flex items-center h-[20px] gap-1 mt-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="absolute top-2 right-2 transition-all duration-300 ease-in-out transform group-hover:scale-105">
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-1 bg-white rounded-full group-hover:bg-[#EDF4FF] transition-all duration-300">
            <Skeleton className="w-4 h-4 rounded-full" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[150px] p-0 bg-white rounded-xl text-s border-none shadow-xl">
          <div className='py-2'>
            <Skeleton className="h-[32px] w-full mb-1" />
            <Skeleton className="h-[32px] w-full mb-1" />
            <Skeleton className="h-[32px] w-full" />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  </div>
)
export const ResumeSkeleton = () => (
  <div className="flex flex-wrap gap-4 p-4">
      <div className="w-[200px] h-[300px] m-2">
        <div className="w-full h-full text-left focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg">
          <div className="bg-white w-full h-full p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center">
            <Plus className="w-12 h-12 text-gray-400 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </div>
      {[...Array(10)].map((_, index) => (
        <SkeletonResumeCard key={index} />
      ))}
  </div>
)