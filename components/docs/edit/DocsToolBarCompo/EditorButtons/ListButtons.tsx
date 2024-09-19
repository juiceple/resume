import React from 'react';
import { Editor } from '@tiptap/react';
import {
    List,
} from 'lucide-react';

interface ListProps {
  editor: Editor;
}

const ListButtons:  React.FC<ListProps> = ({ editor })=> {
  return (
    <div id="bullet-point" className="flex flex-row gap-[6px] items-center justofy-center">
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive('bulletList') ? 'w-[32px] h-[32px] bg-[#C7DDFF] rounded-[5px] flex items-center justify-center' : 'w-[32px] h-[32px] flex items-center justify-center'}
                    >
                        <List size={20}/>
                    </button>
                </div>
            
  );
};

export default ListButtons;
