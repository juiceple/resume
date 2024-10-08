import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Calendar from "./Calendar";

interface DegreeProps {
    leftContent: React.ReactNode;
    onDateUpdate: (date: string) => void;
    initialDate?: string;
}

export default function Degree({
    leftContent,
    onDateUpdate,
    initialDate
}: DegreeProps) {
    const [date, setDate] = useState<string | undefined>(initialDate);
    const [isPopoverOpen, setPopoverOpen] = useState(false);

    useEffect(() => {
        setDate(initialDate);
    }, [initialDate]);

    const handleDateSelect = (selectedDate: string) => {
        setDate(selectedDate);
        setPopoverOpen(false);
        onDateUpdate(selectedDate);
    };

    const dateStyle = (date: string | undefined) => ({
        color: date ? 'inherit' : '#aaa'
      });

    return (
        <div className="w-full flex items-center justify-between">
            <div className="flex flex-row justify-start">
                {leftContent}
            </div>
            <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <div 
                        className={`custom-date-picker date-text flex cursor-pointer ${isPopoverOpen ? 'popover-open' : ''}`}
                        onClick={() => setPopoverOpen(true)}
                        style={dateStyle(date)}
                    >
                        <div className="mr-1">
                            Graduation Date:
                        </div>
                        <span>
                            {date || ''}
                            </span>
                    </div>
                </PopoverTrigger>
                <PopoverContent>
                    <Calendar sendDateInfo={handleDateSelect} showPresentButton={false}/>
                </PopoverContent>
            </Popover>
        </div>
    );
}