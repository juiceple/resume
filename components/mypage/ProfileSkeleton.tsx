import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"

const SelectOptionSkeleton: React.FC<{ isDouble?: boolean, title: string }> = ({ isDouble = false, title }) => (
    <div className="mb-6">
        <h2 className="pl-2 text-xl font-semibold mb-2">{title}</h2>
        <div className={`flex ${isDouble ? 'gap-32' : ''}`}>
            <Skeleton className="h-10 w-[180px] rounded" />
            {isDouble && <Skeleton className="h-10 w-[180px] rounded" />}
        </div>
    </div>
);

const ProfileSkeleton: React.FC = () => {
    return (
        <div className='flex flex-col pb-4'>
            <SelectOptionSkeleton title="현재 경력" />
            <SelectOptionSkeleton isDouble title="직종" />
            <hr className="my-6 border-gray-200" />
            <SelectOptionSkeleton isDouble title="지원하고자 하는 직무는 무엇인가요?" />
            <SelectOptionSkeleton title="취업하고자 하는 국가는 어디인가요?" />
            <div className='flex justify-end pr-10'>
                <button
                    className="bg-blue-500 text-white px-6 py-2 rounded-full"
                >
                    저장하기
                </button>
            </div>
        </div>
    );
};

export default ProfileSkeleton;