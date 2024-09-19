'use client';
import { Bot } from "lucide-react";
import { useState } from 'react';
import { Litag } from "./Litag";
import {Ultag} from "./Ultag";


export default function BulletPoint(props: any) {
    // State to manage visibility of right and left icons
    const [showRightIcon, setShowRightIcon] = useState(false);
    const [showLeftIcon, setShowLeftIcon] = useState(false);

    // Function to handle mouse enter and leave events
    const handleMouseEnter = () => {
        setShowRightIcon(true);
    };

    const handleMouseLeave = () => {
        if (!showLeftIcon) {
            setShowRightIcon(false);
        }
    };

    // Function to handle click event
    const handleClick = () => {
        setShowRightIcon(false);
        setShowLeftIcon(true);
    };

    return (
        <div
            className="flex relative w-full items-start"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {showLeftIcon && (
                <div className="left-icon">
                    <button>
                        <Bot color="#000000" />
                    </button>
                </div>
            )}
            <div className="w-full">
                {props.listContent}
            </div>
            {showRightIcon && !showLeftIcon && (
                <div className="right-icon" onClick={handleClick}>
                    <Bot color="#000000" />Generate point
                </div>
            )}
        </div>
    );
}
