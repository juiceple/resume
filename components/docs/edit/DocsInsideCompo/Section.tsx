import React from "react";
import { GripVertical, CirclePlus } from "lucide-react";

const Section = (props: any) => {
    return (
        <div className="w-full flex items-center justify-between">
            <div className="flex flex-row gap-2 items-center justify-start">
                <div className="min-w-[60px]">
                    {props.SectionleftContent}
                </div>
                <div className="flex items-center tooltip pdf-exclude">
                <span className="tooltiptext">{props.tooltipText}</span>
                    <button onClick={props.addCompany} className=" flex items-center justify-between">
                        <CirclePlus className="w-4 h-4"/>
                    </button>
  
                </div>
            </div>
            <div 
                className="flex flex-row relative items-center pdf-exclude cursor-pointer" 
                {...props.dragHandleProps}
            >
                <GripVertical />
            </div>
        </div>
    );
}

export default Section;