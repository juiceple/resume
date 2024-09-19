import React from 'react';
import { Editor } from '@tiptap/react';
import {Link, Unlink} from 'lucide-react'
interface LinkProps {
  editor: Editor;
  setLink: any;
}

const LinkButtons:  React.FC<LinkProps> = ({ editor, setLink })=> {
  return (
        <div id="link" className="flex flex-row gap-[6px] items-center">
            <button onClick={setLink} className={editor.isActive('link') ? 'w-[32px] h-[32px] bg-[#C7DDFF] rounded-[5px] flex items-center justify-center' : 'w-[32px] h-[32px] flex items-center justify-center'}>
              <Link size={20}/>
            </button>
            <button
              onClick={() => editor.chain().focus().unsetLink().run()}
              disabled={!editor.isActive('link')}
            >
              <Unlink size={20}/>
            </button>
        </div>
            
  );
};

export default LinkButtons;
