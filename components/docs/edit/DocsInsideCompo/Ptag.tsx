import styled from "styled-components";
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React from 'react'

export const Ptag = styled.p`
  color: rgb(50,50,50);
  &:empty::before {
    content: attr(data-placeholder);
    color: gray;
  }
`;

// export default () => {
//     return (
//       <NodeViewWrapper className="react-component">
//         <label contentEditable={false}>React Component</label>
  
//         <NodeViewContent className="content is-editable" />
//       </NodeViewWrapper>
//     )
//   }