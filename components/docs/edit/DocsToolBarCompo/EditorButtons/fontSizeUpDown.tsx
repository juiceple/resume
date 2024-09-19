import React, { useEffect, useState } from 'react';
import { Minus, Plus, ALargeSmall } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface FontSizeControllerProps {
  docsId: string;
}

export function FontSizeController({ docsId }: FontSizeControllerProps) {
  const [fontSizeChange, setFontSizeChange] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const loadFontSize = async () => {
      const { data, error } = await supabase
        .from('resumes')
        .select('font_size')
        .eq('id', docsId)
        .single();

      if (error) {
        console.error('Error loading font size:', error);
      } else if (data && data.font_size !== null) {
        setFontSizeChange(data.font_size);
      } else {
        setFontSizeChange(0); // 기본값 설정
      }
    };

    loadFontSize();
  }, [docsId]);

  const updateFontSize = async (change: number) => {
    const docElement = document.querySelector('.doc') as HTMLElement;
    const basicInfoName = document.querySelector('#BasicInfo-name .tiptap') as HTMLElement;
    const otherTiptaps = document.querySelectorAll('.tiptap:not(#BasicInfo-name .tiptap)');
    const datePickers = document.querySelectorAll('.date-text');

    if (docElement) {
      if (basicInfoName) {
        basicInfoName.style.fontSize = `calc(21.3px + ${change}px)`;
      }
      
      otherTiptaps.forEach((element) => {
        (element as HTMLElement).style.fontSize = `calc(13.3px + ${change}px)`;
      });

      datePickers.forEach((element) => {
        (element as HTMLElement).style.fontSize = `calc(13.3px + ${change}px)`;
      });
    }

    const { error } = await supabase
      .from('resumes')
      .update({ font_size: change })
      .eq('id', docsId);

    if (error) {
      console.error('Error updating font size:', error);
    }
  };

  useEffect(() => {
    if (fontSizeChange !== null) {
      updateFontSize(fontSizeChange);
    }
  }, [fontSizeChange]);

  const changeFontSize = (delta: number) => {
    setFontSizeChange(prevChange => {
      if (prevChange === null) return delta;
      const newChange = prevChange + delta;
      updateFontSize(newChange);
      return newChange;
    });
  };

  if (fontSizeChange === null) {
    return <div>Loading...</div>; // 또는 적절한 로딩 상태 표시
  }

  return (
    <div id="font-size-up-down" className="flex flex-row items-center gap-[6px]">
      <button onClick={() => changeFontSize(-1)} aria-label="Decrease font size">
        <Minus size={20} />
      </button>
      <ALargeSmall size={20}/>
      <button onClick={() => changeFontSize(1)} aria-label="Increase font size">
        <Plus size={20}/>
      </button>
    </div>
  );
}