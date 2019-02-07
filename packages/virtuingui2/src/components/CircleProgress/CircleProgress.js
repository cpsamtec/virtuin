import React from 'react';
import styled from '@emotion/styled/macro';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

const CircleProgressContainer = styled.div`
  width: 36px;
  height: 36px;
  border: solid 1px #ccc;
  border-radius: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CircleProgressFront = styled(CircularProgress)`
  color: #19DC49;
  position: absolute;
  left: -4px;
`;

const Progress = styled(Typography)`
  font-size: 10px;
  color: #ccc;
`;

const CircleButtonComponent = ({onClick, value}) => (
  <CircleProgressContainer>
    <CircleProgressFront variant="static" value={value} thickness={2} size={44}/>
    <Progress>{Math.floor(value)}</Progress>
  </CircleProgressContainer>
);

export default CircleButtonComponent;