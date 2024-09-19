import styled from "styled-components";

export const Ultag = styled.ul`
  color: rgb(50,50,50);
  &:empty::before {
    content: attr(data-placeholder);
    color: gray;
  }
`;