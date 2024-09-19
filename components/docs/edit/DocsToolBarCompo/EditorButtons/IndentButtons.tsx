import React from 'react';
import { Editor } from '@tiptap/react';
import {
  IndentIncrease, 
  IndentDecrease,
} from 'lucide-react'

interface IndentProps {
  editor: Editor;
}

const IndentButtons: React.FC<IndentProps> = ({ editor }) => {
  return (
    <div id="indent" className="flex flex-row gap-[6px] items-center">
      <button onClick={() => editor.chain().focus().indent().run()} className={editor.isActive('indent') ? 'bg-[#C7DDFF]' : ''}>
        <IndentIncrease size={20}/>
      </button>
      <button onClick={() => editor.chain().focus().outdent().run()} className={editor.isActive('outdent') ? 'bg-[#C7DDFF]' : ''}>
        <IndentDecrease size={20}/>
      </button>
    </div>
  );
};

export default IndentButtons;