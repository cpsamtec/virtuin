import styled from '@emotion/styled';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Resizable from 're-resizable';

export const MessageConsoleWrapper = styled.div`
  position: absolute;
  bottom: 15px;
  left: 15px;
  right: 15px;
  
`;

export const ConsoleButton = styled(Button, {shouldForwardProp: prop => prop !== 'open'})`
  position: absolute;
  top: ${props => props.open ? 0 : '-36px'};
  transition: top 300ms cubic-bezier(0.4, 0, 0.2, 1);
  background: #ccc;
  border-radius: 0;
  padding-left: 15px;
  padding-right: 15px;
  z-index: 2;
  &:hover {
    background: #bbb;
  }
`;
export const ConsoleText = styled.span`
  margin-right: 10px;
  color: #444;
  text-transform: none;
`;
export const Console = styled(Resizable)`
  padding-top: 36px;
  background: #ccc;
  max-height: 60vh;
`;

export const ConsoleMessage = styled(Typography)`
  padding: 5px 0;
  color: #444;
`;

export const DividerLine = styled.div`
  width: 100%;
  border-bottom: solid 1px #bbb;
`;

export const ConsoleTextArea = styled.div`
  height: 100%;
  padding: 15px;
  padding-top: 5px;
  padding-bottom: 10px;
  overflow-y: scroll;
`;