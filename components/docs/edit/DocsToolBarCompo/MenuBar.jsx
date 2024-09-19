// 도구 모음 (툴바) 관련 컴포넌트들 가져오기
import MarkButtons from './EditorButtons/MarkButtons';
import TextAlignButtons from './EditorButtons/TextAlignButtons';
import LinkButtons from './EditorButtons/LinkButtons';
import IndentButtons from './EditorButtons/IndentButtons';
import ListButtons from './EditorButtons/ListButtons';
import ColorButtons from './EditorButtons/ColorButtons';
import { FontSelector } from './EditorButtons/fontSelector';
import { FontSizeController } from './EditorButtons/fontSizeUpDown';
import { SpacingButtons } from './EditorButtons/SpacingButtons';
import { useCallback } from 'react';


// MenuBar 컴포넌트 정의 (편집기 도구 모음)
const MenuBar = ({ editor, docsId }) => {
  // 링크를 설정하기 위한 함수 정의 (사용자에게 URL을 입력받음)
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href; // 이전에 설정된 링크 URL 가져오기
    const url = window.prompt('URL', previousUrl); // 사용자에게 새로운 URL 입력 요청
    
    if (url === null) {
      return; // 사용자가 취소를 누른 경우 아무 작업도 하지 않음
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run(); // 빈 입력이면 링크를 제거
      return;
    }

    // 입력된 URL로 링크를 설정
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null; // 편집기 인스턴스가 없으면 아무것도 렌더링하지 않음
  }

  return (
      <div className="Resume-color-0 flex flex-row gap-[6px] justify-center">
        <div id="roll-back"></div>
        <FontSelector docsId={docsId} />
        <FontSizeController docsId={docsId}/>
        <MarkButtons editor={editor} />
        <ColorButtons editor={editor} />
        <TextAlignButtons editor={editor} />
        <SpacingButtons docsId={docsId} />
        <ListButtons editor={editor} />
        <IndentButtons editor={editor} />
        <LinkButtons editor={editor} setLink={setLink} />
      </div>
  );
};

export default MenuBar;