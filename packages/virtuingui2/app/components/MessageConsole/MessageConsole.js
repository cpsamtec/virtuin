import React, { useState }  from 'react';
import Collapse from '@material-ui/core/Collapse';
import Chip from '@material-ui/core/Chip';

const hashCode = (s) => {
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}

import { ConsoleArea, ConsoleButtonList, ConsoleButton, ConsoleText, Console, DividerLine, ConsoleTextArea, ConsoleMessage } from './MessageConsole.style';
const MessageConsole = ({messages, stdout, stderr, developerMode}) => {
  const [open, setOpen] = useState(true);
  const [openIdx, setIdx] = useState(0);
  console.log(developerMode);
  const buttonClick = (idx) => {
    if (open && idx === openIdx) {
      setOpen(!open);
      setIdx(-1);
    } else if (open) {
      setIdx(idx);
    } else {
      setOpen(true);
      setIdx(idx);
    }
  }
  return (
    <ConsoleArea>
      <Collapse in={open} collapsedHeight="36px">
        <Console
          defaultSize={{ width:'100%', height:200 }}
          minHeight={150}
          enable={{top:true, right:false, bottom:false, left:false, topRight:false, bottomRight:false, bottomLeft:false, topLeft:false}}
        >
          <ConsoleButtonList>
          <ConsoleButton onClick={buttonClick.bind(null, 0)} active={openIdx === 0}>
              <ConsoleText>Messages</ConsoleText>
              <Chip label={messages ? messages.length : 0} />
          </ConsoleButton>
          {developerMode && 
            <>
            <ConsoleButton onClick={buttonClick.bind(null, 1)} active={openIdx === 1}>
              <ConsoleText>Std. Out</ConsoleText>
              <Chip label={stdout ? 1 : 0} />
              </ConsoleButton>
              <ConsoleButton onClick={buttonClick.bind(null, 2)} active={openIdx === 2}>
                  <ConsoleText>Std. Err</ConsoleText>
                  <Chip label={stderr ? 1 : 0} />
              </ConsoleButton>
            </>
          }
        </ConsoleButtonList>
          <ConsoleTextArea visible={openIdx === 0}>
            {messages && messages.map((message, idx) => <ConsoleMessage key={`${hashCode(message.substring(Math.min(message.length, 20)))}${idx}`}>{message}</ConsoleMessage>)}
          </ConsoleTextArea>
          {developerMode && <>
            <ConsoleTextArea visible={openIdx === 1}>
              {stdout && <ConsoleMessage>{stdout}</ConsoleMessage>}
            </ConsoleTextArea>
            <ConsoleTextArea visible={openIdx === 2}>
              {stderr && <ConsoleMessage>{stderr}</ConsoleMessage>}
            </ConsoleTextArea>
          </>}
          
        </Console>
      </Collapse>
    </ConsoleArea>
  )
}

export default MessageConsole;