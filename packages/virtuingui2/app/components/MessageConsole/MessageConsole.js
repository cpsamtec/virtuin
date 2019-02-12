import React, { useState }  from 'react';
import Collapse from '@material-ui/core/Collapse';
import Chip from '@material-ui/core/Chip';

const hashCode = (s) => {
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}

import { MessageConsoleWrapper, ConsoleButton, ConsoleText, Console, DividerLine, ConsoleTextArea, ConsoleMessage } from './MessageConsole.style';
const MessageConsole = ({messages}) => {
  const [open, setOpen] = useState(true);
  return (
    <MessageConsoleWrapper>
      <ConsoleButton onClick={() => {setOpen(!open)}} open={open}>
          <ConsoleText>Messages</ConsoleText>
          <Chip label={messages ? messages.length : 0} />
      </ConsoleButton>
    
      <Collapse in={open}>
        <Console
          defaultSize={{ width:'100%', height:200 }}
          minHeight={150}
          enable={{top:true, right:false, bottom:false, left:false, topRight:false, bottomRight:false, bottomLeft:false, topLeft:false}}
        >
          <DividerLine />
          <ConsoleTextArea>
            {messages && messages.map((message, idx) => <ConsoleMessage key={`${hashCode(message.substring(Math.min(message.length, 20)))}${idx}`}>{message}</ConsoleMessage>)}
          </ConsoleTextArea>
          
        </Console>
      </Collapse>
    </MessageConsoleWrapper>
    
  )
}

export default MessageConsole;