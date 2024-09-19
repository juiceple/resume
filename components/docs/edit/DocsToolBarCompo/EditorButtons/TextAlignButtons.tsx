import React from 'react';
import { Editor } from '@tiptap/react';
import {
    AlignLeft,
    AlignRight, 
    AlignJustify,
    AlignCenter,
} from 'lucide-react'

interface TextAlignProps {
  editor: Editor;
}

const TextAlignButtons:  React.FC<TextAlignProps> = ({ editor })=> {
  return (
    <div id="text-align" className="flex gap-[6px] items-center justify-center">
      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'w-[32px] h-[32px] bg-[#C7DDFF] rounded-[5px] flex items-center justify-center' : 'w-[32px] h-[32px] flex items-center justify-center'}>
        <AlignLeft size={20}/>
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'w-[32px] h-[32px] bg-[#C7DDFF] rounded-[5px] flex items-center justify-center' : 'w-[32px] h-[32px] flex items-center justify-center'}>
        <AlignCenter size={20}/>
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'w-[32px] h-[32px] bg-[#C7DDFF] rounded-[5px] flex items-center justify-center' : 'w-[32px] h-[32px] flex items-center justify-center'}>
        <AlignRight size={20}/>
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'w-[32px] h-[32px] bg-[#C7DDFF] rounded-[5px] flex items-center justify-center' : 'w-[32px] h-[32px] flex items-center justify-center'}>
        <AlignJustify size={20}/>
      </button>
    </div>
            
  );
};

export default TextAlignButtons;
