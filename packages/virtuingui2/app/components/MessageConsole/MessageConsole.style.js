import styled from '@emotion/styled';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Resizable from 're-resizable';

export const MessageConsoleWrapper = styled.div`
  position: relative;
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
    background: #ccc;
  }
`;
export const ConsoleText = styled.span`
  margin-right: 10px;
  color: #444;
  text-transform: none;
`;
export const Console = styled(Resizable)`
  background: #ccc;
  max-height: 60vh;
  overflow: hidden;
`;

export const ConsoleMessage = styled(Typography)`
  padding: 5px 0;
  font-size: 12px;
  color: #666;
  border-bottom: solid 1px #bbb;
`;

export const DividerLine = styled.div`
  width: 100%;
  background: #bbb;
  height: 36px;
`;

export const ConsoleTextArea = styled.div`
  height: 100%;
  padding: 15px;
  padding-top: 5px;
  padding-bottom: 10px;
  overflow-y: scroll;
`;