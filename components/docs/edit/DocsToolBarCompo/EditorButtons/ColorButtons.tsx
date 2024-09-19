import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {Baseline} from 'lucide-react'

interface ColorButtonProps {
    color: string;
    editor: Editor;
    isActive: boolean;
}

interface ColorButtonsProps {
  editor: Editor;
}

const colorList = [
  '#000000',
  "#1322B1",
  '#5376D0',
  "#424242",
  '#761622',
  '#106E22'
];

const ColorButton:  React.FC<ColorButtonProps> = ({ color, editor, isActive })=> {
  return (
    <div id="text-color">
      <button
        onClick={() => editor.chain().focus().setColor(color).run()}
        className={`${
          isActive ? 'is-active' : ''
        } w-8 h-8 rounded-full`}
        style={{ backgroundColor: color }}
        data-testid={ color.slice(2)} // Dynamically set the test ID
      ></button>
    </div>
  );
};

const ColorButtons:  React.FC<ColorButtonsProps> = ({ editor })=> {
  return (
    <div id="font-color" className="flex flex-row items-center">
            <Popover>
              <PopoverTrigger>
                <Baseline color={editor.getAttributes('textStyle').color}/>
              </PopoverTrigger>
              <PopoverContent className="w-auto">
                <div className="grid grid-cols-3 gap-2 py-2 px-4">
                  {colorList.map((color) => (
                    <ColorButton
                      key={color} // Unique key for each button
                      color={color}
                      editor={editor}
                      isActive={editor.isActive('textStyle', { color })}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
           
     </div>      
  );
};

export default ColorButtons;
