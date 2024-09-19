'use client'
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from 'react';

interface CalendarProps {
  sendDateInfo: (date: string) => void;
  showPresentButton?: boolean;
}

export default function Calendar({ sendDateInfo, showPresentButton = false }: CalendarProps) {
  const now = new Date();
  const yearOfNow = now.getFullYear();
  const [year, setYear] = useState(yearOfNow);

  const handleDecreaseYear = () => {
    setYear((prevYear) => prevYear - 1);
  };

  const handleIncreaseYear = () => {
    setYear((prevYear) => prevYear + 1);
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const handleMonthClick = (month: string) => {
    sendDateInfo(`${year} ${month}`);
  };

  const handlePresentClick = () => {
    sendDateInfo("Present");
  };

  return (
    <div className="flex flex-col gap-[6px] items-center bg-white w-[140px] p-[8px] text-[10px] shadow-lg rounded-md">
      {/* Year Navigation */}
      <div id="year" className="w-full h-[12px] flex justify-between items-center">
        <button className="flex justify-center basis-1/5" onClick={handleDecreaseYear}>
          <ChevronLeft size={12} />
        </button>
        <div className="flex justify-center basis-3/5">{year}</div>
        <button className="flex justify-center basis-1/5" onClick={handleIncreaseYear}>
          <ChevronRight size={12} />
        </button>
      </div>
      {/* Month Buttons */}
      <div id="month" className="w-full h-auto grid grid-cols-3 justify-between">
        {months.map((month) => (
          <button
            key={month}
            className="p-1 rounded hover:bg-black hover:text-white"
            onClick={() => handleMonthClick(month)}
          >
            {month}
          </button>
        ))}
      </div>
      {/* Present Button (Conditional) */}
      {showPresentButton && (
        <div className="w-full">
          <button
            className="w-full p-1 rounded hover:bg-black hover:text-white"
            onClick={handlePresentClick}
          >
            Present
          </button>
        </div>
      )}
    </div>
  );
}