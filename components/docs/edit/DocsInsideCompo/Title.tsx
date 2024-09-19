'use client'
import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Calendar from "./Calendar";

interface TitleProps {
  leftContent: React.ReactNode;
  onDateUpdate: (dateType: 'entryDate' | 'exitDate', value: string) => void;
  initialEntryDate: string | null;
  initialExitDate: string | null;
}

export default function Title({ 
  leftContent, 
  onDateUpdate, 
  initialEntryDate, 
  initialExitDate 
}: TitleProps) {
  const [entryDate, setEntryDate] = useState<string | null>(initialEntryDate);
  const [exitDate, setExitDate] = useState<string | null>(initialExitDate);
  const [isEntryPopoverOpen, setEntryPopoverOpen] = useState(false);
  const [isExitPopoverOpen, setExitPopoverOpen] = useState(false);

  useEffect(() => {
    setEntryDate(initialEntryDate);
    setExitDate(initialExitDate);
  }, [initialEntryDate, initialExitDate]);

  const handleDateSelect = (type: '입사일' | '퇴사일') => (selectedDate: string) => {
    if (type === '입사일') {
      setEntryDate(selectedDate);
      setEntryPopoverOpen(false);
      onDateUpdate('entryDate', selectedDate);
    } else if (type === '퇴사일') {
      setExitDate(selectedDate);
      setExitPopoverOpen(false);
      onDateUpdate('exitDate', selectedDate);
    }
  };

  return (
    <div className="w-full flex items-center justify-between">
      <div className="flex flex-row justify-start">
        {leftContent}
      </div>
      <div contentEditable={false} className="flex flex-row relative items-center">
        <Popover open={isEntryPopoverOpen} onOpenChange={setEntryPopoverOpen}>
          <PopoverTrigger asChild>
            <div className={`custom-date-picker date-text flex cursor-pointer ${isEntryPopoverOpen ? 'popover-open' : ''}`} onClick={() => setEntryPopoverOpen(true)}>
              {entryDate || '입사일'}
            </div>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar sendDateInfo={handleDateSelect('입사일')} showPresentButton={false} />
          </PopoverContent>
        </Popover>
        <span>&nbsp;-&nbsp;</span>
        <Popover open={isExitPopoverOpen} onOpenChange={setExitPopoverOpen}>
          <PopoverTrigger asChild>
            <div className={`custom-date-picker date-text flex cursor-pointer ${isExitPopoverOpen ? 'popover-open' : ''}`} onClick={() => setExitPopoverOpen(true)}>
              {exitDate || '퇴사일'}
            </div>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar sendDateInfo={handleDateSelect('퇴사일')} showPresentButton={true} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}