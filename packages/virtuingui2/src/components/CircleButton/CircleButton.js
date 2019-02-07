import React from 'react';
import styled from '@emotion/styled/macro';



import ButtonBase from '@material-ui/core/ButtonBase';

export const CircleButton = styled(ButtonBase, {shouldForwardProp: prop => prop !== 'fullWhite'})`
  width: 36px;
  height: 36px;
  border: ${props => props.fullWhite ? `solid 1px #fff` : `solid 1px #ccc`};
  border-radius: 100px;
  color: ${props => props.fullWhite ? `#fff` : `#ccc`};
  fill: ${props => props.fullWhite ? `#fff` : `#ccc`};
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    border: solid 1px #fff;
    color: #fff;
    fill: #fff;
  }
`;

const CircleButtonComponent = ({children, onClick, fullWhite, disabled}) => (
  <CircleButton onClick={onClick} fullWhite={fullWhite} disabled={disabled}>
    {children}
  </CircleButton>
);

export default CircleButtonComponent;