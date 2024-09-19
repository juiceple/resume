import styled from "styled-components";

export const Litag = styled.li`
  color: rgb(50,50,50);
  &:empty::before {
    content: attr(data-placeholder);
    color: gray;
    ::marker {color:gray;}
  };
    &:empty::marker {
  color: gray;
    }
`;

