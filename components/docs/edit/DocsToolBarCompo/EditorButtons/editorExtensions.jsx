// editorExtensions.jsx

// Tiptap 관련 확장 기능들 임포트
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import { Indent } from '@/lib/indent'
// import ReactComponent from './extension.js'; // 사용자 정의 확장 기능

// Tiptap 확장 기능들을 배열로 정의
const extensions = [
  StarterKit,
  TextAlign.configure({
    types: ['heading', 'paragraph'], // 정렬을 설정할 수 있는 블록 타입들
  }),
  TextStyle,
  Color,
  LinkExtension.configure({
    openOnClick: true, // 링크를 클릭하면 열기
    autolink: true, // 자동으로 링크로 변환
    defaultProtocol: 'https', // 기본 프로토콜 설정
    protocols: [
      {
        scheme: 'tel', // 전화 링크 설정
        optionalSlashes: true,
      },
    ],
  }),
  Underline,
  BulletList,
  // ReactComponent, // 사용자 정의 확장 기능
  Indent.configure({
    types: ['listItem'],
    minLevel: 0,
    maxLevel: 8,
}),
];

export default extensions; // 확장 기능들을 기본으로 익스포트
