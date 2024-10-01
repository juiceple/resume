'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Calendar from "./Calendar";
import { Trash2 } from "lucide-react";

interface TitleProps {
  leftContent: React.ReactNode;
  onDateUpdate: (dateType: 'entryDate' | 'exitDate', value: string) => void;
  initialEntryDate: string | null;
  initialExitDate: string | null;
  onDelete: () => void;
}

export default function Title({ 
  leftContent, 
  onDateUpdate, 
  initialEntryDate, 
  initialExitDate,
  onDelete
}: TitleProps) {
  const [entryDate, setEntryDate] = useState<string | null>(initialEntryDate);
  const [exitDate, setExitDate] = useState<string | null>(initialExitDate);
  const [isEntryPopoverOpen, setEntryPopoverOpen] = useState(false);
  const [isExitPopoverOpen, setExitPopoverOpen] = useState(false);
  const [isComponentHovered, setIsComponentHovered] = useState(false);
  const [isDeleteButtonHovered, setIsDeleteButtonHovered] = useState(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

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

  const handleMouseEnter = () => {
    setIsComponentHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    // 마우스가 삭제 버튼 위에 있지 않을 때만 hover 상태를 해제합니다.
    if (!deleteButtonRef.current?.contains(e.relatedTarget as Node)) {
      setIsComponentHovered(false);
    }
  };

  const showDeleteButton = isComponentHovered || isDeleteButtonHovered;

  return (
    <div 
      className="w-full flex items-center justify-between relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showDeleteButton && (
        <button 
          ref={deleteButtonRef}
          onClick={onDelete}
          onMouseEnter={() => setIsDeleteButtonHovered(true)}
          onMouseLeave={() => setIsDeleteButtonHovered(false)}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 p-1 text-red-500 rounded-full hover:text-red-600 transition-colors duration-200 pdf-exclude"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
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