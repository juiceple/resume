import React from 'react';
import { Editor } from '@tiptap/react';
import {Bold,Italic,Underline} from 'lucide-react'

interface MarkProps {
  editor: Editor;
}

const MarkButtons:  React.FC<MarkProps> = ({ editor })=> {
  return (
  <div id="text-mark" className="flex flex-row gap-[6px] items-center justify-center">
    <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'w-[32px] h-[32px] bg-[#C7DDFF] rounded-[5px] flex items-center justify-center' : 'w-[32px] h-[32px] flex items-center justify-center'}>
        <Bold size={20}/>
    </button>
    <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'w-[32px] h-[32px] bg-[#C7DDFF] rounded-[5px] flex items-center justify-center' : 'w-[32px] h-[32px] flex items-center justify-center'}>
        <Italic size={20}/>
    </button>
    <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'w-[32px] h-[32px] bg-[#C7DDFF] rounded-[5px] flex items-center justify-center' : 'w-[32px] h-[32px] flex items-center justify-center'}
    >
        <Underline size={20}/>
    </button>
  </div>
            
  );
};

export default MarkButtons;
