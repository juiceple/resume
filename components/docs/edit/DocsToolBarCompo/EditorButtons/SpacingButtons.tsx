'use client'

import React, { useEffect, useState } from 'react';
import { Minus, Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface SpacingButtonsProps {
  docsId: string;
}

export function SpacingButtons({ docsId }: SpacingButtonsProps) {
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const minLineSpacing = 1;
  const maxLineSpacing = 3;
  const supabase = createClient();

  useEffect(() => {
    const loadLineSpacing = async () => {
      // Note: Uncomment and modify this section when the 'line_spacing' column is added to the 'resumes' table
      
      const { data, error } = await supabase
        .from('resumes')
        .select('line_spacing')
        .eq('id', docsId)
        .single();

      if (error) {
        console.error('Error loading line spacing:', error);
      } else if (data && data.line_spacing !== null) {
        setLineSpacing(data.line_spacing);
      }
      
    };

    loadLineSpacing();
  }, [docsId]);

  const updateLineSpacing = async (spacing: number) => {
    const docElement = document.querySelector('.doc') as HTMLElement;
    if (docElement) {
      docElement.style.lineHeight = spacing.toString();
    }

    // Note: Uncomment and modify this section when the 'line_spacing' column is added to the 'resumes' table
   
    const { error } = await supabase
      .from('resumes')
      .update({ line_spacing: spacing })
      .eq('id', docsId);

    if (error) {
      console.error('Error updating line spacing:', error);
    }
    
  };

  useEffect(() => {
    updateLineSpacing(lineSpacing);
  }, [lineSpacing]);

  const increaseSpacing = () => {
    setLineSpacing(prevSpacing => {
      const newSpacing = Math.min(maxLineSpacing, prevSpacing + 0.1);
      updateLineSpacing(newSpacing);
      return newSpacing;
    });
  };

  const decreaseSpacing = () => {
    setLineSpacing(prevSpacing => {
      const newSpacing = Math.max(minLineSpacing, prevSpacing - 0.1);
      updateLineSpacing(newSpacing);
      return newSpacing;
    });
  };

  return (
    <div id="line-spacing" className="flex flex-row gap-[6px] items-center">
      <button onClick={decreaseSpacing} aria-label="Decrease line spacing">
        <Minus size={20}/>
      </button>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 24 20" fill="none">
<path d="M12.5 3.74999C12.5 3.28975 12.9477 2.91666 13.5 2.91666H20.5C21.0523 2.91666 21.5 3.28975 21.5 3.74999C21.5 4.21023 21.0523 4.58332 20.5 4.58332H13.5C12.9477 4.58332 12.5 4.21023 12.5 3.74999Z" fill="#475569"/>
<path d="M5.5 15.4167C5.5 15.8769 5.9477 16.25 6.5 16.25C7.0523 16.25 7.5 15.8769 7.5 15.4167V5.76182L8.7929 6.83924C9.1834 7.16466 9.8166 7.16466 10.2071 6.83924C10.5976 6.51382 10.5976 5.98616 10.2071 5.66074L7.2071 3.16073C7.0196 3.00446 6.7652 2.91666 6.5 2.91666C6.2348 2.91666 5.9804 3.00446 5.7929 3.16073L2.7929 5.66074C2.40237 5.98616 2.40237 6.51382 2.7929 6.83924C3.1834 7.16466 3.8166 7.16466 4.2071 6.83924L5.5 5.76182V15.4167Z" fill="#475569"/>
<path d="M5.5 6.24999C5.5 5.78974 5.9477 5.41666 6.5 5.41666C7.0523 5.41666 7.5 5.78974 7.5 6.24999V14.2382L8.7929 13.1607C9.1834 12.8353 9.8166 12.8353 10.2071 13.1607C10.5976 13.4862 10.5976 14.0138 10.2071 14.3392L7.2071 16.8392C7.0196 16.9955 6.7652 17.0833 6.5 17.0833C6.2348 17.0833 5.9804 16.9955 5.7929 16.8392L2.7929 14.3392C2.40237 14.0138 2.40237 13.4862 2.7929 13.1607C3.1834 12.8353 3.8166 12.8353 4.2071 13.1607L5.5 14.2382V6.24999Z" fill="#475569"/>
<path d="M12.5 7.91666C12.5 7.45642 12.9477 7.08332 13.5 7.08332H20.5C21.0523 7.08332 21.5 7.45642 21.5 7.91666C21.5 8.37689 21.0523 8.74999 20.5 8.74999H13.5C12.9477 8.74999 12.5 8.37689 12.5 7.91666Z" fill="#475569"/>
<path d="M12.5 12.0833C12.5 11.6231 12.9477 11.25 13.5 11.25H20.5C21.0523 11.25 21.5 11.6231 21.5 12.0833C21.5 12.5436 21.0523 12.9167 20.5 12.9167H13.5C12.9477 12.9167 12.5 12.5436 12.5 12.0833Z" fill="#475569"/>
<path d="M12.5 16.25C12.5 15.7898 12.9477 15.4167 13.5 15.4167H20.5C21.0523 15.4167 21.5 15.7898 21.5 16.25C21.5 16.7102 21.0523 17.0833 20.5 17.0833H13.5C12.9477 17.0833 12.5 16.7102 12.5 16.25Z" fill="#475569"/>
</svg>
      <button onClick={increaseSpacing} aria-label="Increase line spacing">
        <Plus size={20}/>
      </button>
    </div>
  );
}