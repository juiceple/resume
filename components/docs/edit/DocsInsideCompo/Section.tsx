import React, { useState } from "react";
import { GripVertical, Plus, ChevronUp, ChevronDown, Trash2 } from "lucide-react";

const Section = (props: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="w-full flex items-center justify-between relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-row gap-2 items-center justify-start">
        <div className="min-w-[60px]">{props.SectionleftContent}</div>
        <div className="flex items-center tooltip pdf-exclude">
          <span className="tooltiptext">{props.tooltipText}</span>
          <button
            onClick={props.addCompany}
            className="flex items-center justify-center w-4 h-4 text-white bg-[#B8B8B8] rounded-full"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div
        className="flex gap-1 items-center pdf-exclude cursor-pointer"
        {...props.dragHandleProps}
      >
        <div className="tooltip">
          <button
            onClick={props.sectionUp}
            className="flex items-center justify-center rounded-full bg-[#B8B8B8] w-4 h-4 text-white"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <span className="tooltiptext">Section Up</span>
        </div>
        <div className="tooltip">
          <button
            onClick={props.sectionDown}
            className="flex items-center justify-center rounded-full bg-[#B8B8B8] w-4 h-4 text-white"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
          <span className="tooltiptext">Section Down</span>
        </div>
      </div>
      {isHovered && (
        <button 
          onClick={props.onDeleteSection}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 p-1 text-red-500 rounded-full hover:text-red-600 transition-colors duration-200 pdf-exclude"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default Section;