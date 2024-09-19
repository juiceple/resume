import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Check,
  ChevronDown
} from "lucide-react";

const fonts = [
  {
    value: "Times New Roman",
    label: "Times New Roman",
  },
  {
    value: "Noto Sans",
    label: "Noto Sans",
  },
  {
    value: "Arial",
    label: "Arial",
  },
];

interface FontSelectorProps {
  docsId: string;
}

export function FontSelector({ docsId }: FontSelectorProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("Times New Roman");
  const supabase = createClient();

  useEffect(() => {
    const loadFont = async () => {
      const { data, error } = await supabase
        .from('resumes')
        .select('font_family')
        .eq('id', docsId) // 여기에 실제 문서 ID를 넣어주세요
        .single();

      if (error) {
        console.error('Error loading font:', error);
      } else if (data && data.font_family) {
        setValue(data.font_family);
        updateFont(data.font_family);
      }
    };

    loadFont();
  }, []);

  const updateFont = (font: string) => {
    const docElement = document.querySelector('.doc') as HTMLElement;
    if (docElement) {
      docElement.style.fontFamily = font;
    }
  };

  const handleSelectFont = async (currentValue: string) => {
    setValue(currentValue);
    setOpen(false);
    updateFont(currentValue);

    const { error } = await supabase
      .from('resumes')
      .update({ font_family: currentValue })
      .eq('id', docsId); // 여기에 실제 문서 ID를 넣어주세요

    if (error) {
      console.error('Error updating font:', error);
    }
  };

  return (
    <div id="font-selector" className="flex flex-row gap-2 items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {value
              ? fonts.find((framework) => framework.value === value)?.label
              : "Select framework..."}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandGroup>
                {fonts.map((framework) => (
                  <CommandItem
                    key={framework.value}
                    value={framework.value}
                    onSelect={handleSelectFont} // 선택 시 업데이트 함수 호출
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === framework.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {framework.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>

  );
}
