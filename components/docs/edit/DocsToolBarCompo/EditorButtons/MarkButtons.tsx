import React from 'react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, Underline, Baseline } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


interface MarkProps {
  editor: Editor;
}

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

const ColorButton: React.FC<ColorButtonProps> = ({ color, editor, isActive }) => {
  return (
    <div id="text-color">
      <button
        onClick={() => editor.chain().focus().setColor(color).run()}
        className={`${isActive ? 'is-active' : ''
          } w-8 h-8 rounded-full`}
        style={{ backgroundColor: color }}
        data-testid={color.slice(2)} // Dynamically set the test ID
      ></button>
    </div>
  );
};

const MarkButtons: React.FC<MarkProps> = ({ editor }) => {
  const baseButtonClass = "toolBarCompo";
  const activeButtonClass = `${baseButtonClass} bg-[#C7DDFF] rounded-[5px]`;

  return (
    <div id="text-mark" className="flex items-center border-x-[1px] border-[#A4A4A4]">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? activeButtonClass : baseButtonClass}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M14.4231 8.91244L14.3874 8.95602L14.4367 8.98324C15.2168 9.41318 15.8317 10.0902 16.1848 10.9079C16.5379 11.7255 16.6092 12.6374 16.3874 13.5C16.1656 14.3626 15.6633 15.127 14.9596 15.6729C14.2559 16.2188 13.3906 16.5152 12.5 16.5156C12.5 16.5156 12.5 16.5156 12.5 16.5156H6.25C6.01379 16.5156 5.78726 16.4218 5.62023 16.2548C5.45321 16.0877 5.35938 15.8612 5.35938 15.625V3.75C5.35938 3.51379 5.45321 3.28726 5.62023 3.12023C5.78726 2.95321 6.01379 2.85938 6.25 2.85938L11.5625 2.85937C11.5625 2.85937 11.5625 2.85938 11.5625 2.85938C12.2639 2.85963 12.9509 3.05909 13.5434 3.43455C14.1358 3.81001 14.6095 4.34603 14.9092 4.98021C15.2089 5.6144 15.3224 6.32066 15.2363 7.01681C15.1503 7.71295 14.8683 8.37033 14.4231 8.91244ZM7.1875 4.64062H7.14062V4.6875V8.4375V8.48438H7.1875H11.5625C12.0722 8.48438 12.561 8.28189 12.9215 7.92147C13.2819 7.56105 13.4844 7.07221 13.4844 6.5625C13.4844 6.05279 13.2819 5.56395 12.9215 5.20353C12.561 4.84311 12.0722 4.64062 11.5625 4.64062H7.1875ZM7.14062 14.6875V14.7344H7.1875H12.5C13.0926 14.7344 13.6609 14.499 14.0799 14.0799C14.499 13.6609 14.7344 13.0926 14.7344 12.5C14.7344 11.9074 14.499 11.3391 14.0799 10.9201C13.6609 10.501 13.0926 10.2656 12.5 10.2656H7.1875H7.14062V10.3125V14.6875Z" fill="#475569" stroke="#475569" stroke-width="0.09375" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? activeButtonClass : baseButtonClass}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5508 5.26562H12.517L12.5063 5.29768L9.38131 14.6727L9.36075 14.7344H9.42578H11.25C11.4862 14.7344 11.7127 14.8282 11.8798 14.9952C12.0468 15.1623 12.1406 15.3888 12.1406 15.625C12.1406 15.8612 12.0468 16.0877 11.8798 16.2548C11.7127 16.4218 11.4862 16.5156 11.25 16.5156H5C4.76379 16.5156 4.53726 16.4218 4.37023 16.2548C4.20321 16.0877 4.10938 15.8612 4.10938 15.625C4.10938 15.3888 4.20321 15.1623 4.37023 14.9952C4.53726 14.8282 4.76379 14.7344 5 14.7344H7.44922H7.483L7.49369 14.7023L10.6187 5.32732L10.6393 5.26562H10.5742H8.75C8.51379 5.26562 8.28726 5.17179 8.12023 5.00477C7.95321 4.83774 7.85938 4.61121 7.85938 4.375C7.85938 4.13879 7.95321 3.91226 8.12023 3.74523C8.28726 3.57821 8.51379 3.48438 8.75 3.48438H15C15.2362 3.48438 15.4627 3.57821 15.6298 3.74523C15.7968 3.91226 15.8906 4.13879 15.8906 4.375C15.8906 4.61121 15.7968 4.83774 15.6298 5.00477C15.4627 5.17179 15.2362 5.26562 15 5.26562H12.5508Z" fill="#475569" stroke="#475569" stroke-width="0.09375" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? activeButtonClass : baseButtonClass}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15.8906 17.5C15.8906 17.7362 15.7968 17.9627 15.6298 18.1298C15.4627 18.2968 15.2362 18.3906 15 18.3906H5C4.76379 18.3906 4.53726 18.2968 4.37023 18.1298C4.20321 17.9627 4.10938 17.7362 4.10938 17.5C4.10938 17.2638 4.20321 17.0373 4.37023 16.8702C4.53726 16.7032 4.76379 16.6094 5 16.6094H15C15.2362 16.6094 15.4627 16.7032 15.6298 16.8702C15.7968 17.0373 15.8906 17.2638 15.8906 17.5ZM13.7218 13.7218C12.7346 14.7089 11.3961 15.2642 10 15.2656C8.60391 15.2642 7.26542 14.7089 6.27824 13.7218C5.29105 12.7346 4.73581 11.3961 4.73438 9.99995V4.375C4.73438 4.13879 4.82821 3.91226 4.99523 3.74523C5.16226 3.57821 5.38879 3.48438 5.625 3.48438C5.86121 3.48438 6.08774 3.57821 6.25477 3.74523C6.42179 3.91226 6.51562 4.13879 6.51562 4.375V10C6.51562 10.9241 6.88273 11.8104 7.53617 12.4638C8.18962 13.1173 9.07589 13.4844 10 13.4844C10.9241 13.4844 11.8104 13.1173 12.4638 12.4638C13.1173 11.8104 13.4844 10.9241 13.4844 10V4.375C13.4844 4.13879 13.5782 3.91226 13.7452 3.74523C13.9123 3.57821 14.1388 3.48438 14.375 3.48438C14.6112 3.48438 14.8377 3.57821 15.0048 3.74523C15.1718 3.91226 15.2656 4.13879 15.2656 4.375V9.99995C15.2642 11.3961 14.709 12.7346 13.7218 13.7218Z" fill="#475569" stroke="#475569" stroke-width="0.09375" />
        </svg>
      </button>
      <Popover>
        <PopoverTrigger>
          <div className='toolBarCompo'>
            <Baseline color={editor.getAttributes('textStyle').color} size={20} />
          </div>
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

export default MarkButtons;