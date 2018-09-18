import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Resizable from 'react-resizable-box';
import ConsoleIcon from '@material-ui/icons/VideoLabel';

import style from './Console.css';
import ConsoleHandler from './ConsoleHandler';
import s from './ConsoleStyle';

class Console extends Component {
  static propTypes = {
    logs: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string,
      data: PropTypes.string,
      timestamp: PropTypes.string
    })).isRequired
  };

  state = {
    visible: true
  };

  toggleConsole = () => {
    this.setState((prevState) => (
      { visible: !prevState.visible }
    ));
  }

  handleResizeStart = () => {
    this.cover.style.display = 'block';
    this.cover.style.width = '100%';
  }

  handleResizeStop = () => {
    this.cover.style.display = 'none';
    this.cover.style.width = '100%';
  }

  render() {
    return (
      <div className={style.consoleArea}>

        <Button
          style={s.consoleButton}
          size="small"
          color="secondary"
          onClick={this.toggleConsole}
        >
          <ConsoleIcon />
        </Button>
        <div
          className={style.transparentCoverer}
          style={{
            display: 'none',
            width: '100%',
            position: 'absolute',
            top: '-50px',
            height: '50px'
          }}
          ref={(cover) => { this.cover = cover; }}
        />
        <Resizable
          defaultSize={{ width: '100%' }}
          size={{ width: '100%' }}
          width="100%"
          height={200}
          style={{
            width: '100%',
            minHeight: '80px',
            minWidth: '100%', // ### important ###
            maxHeight: 'calc(75vh - 80px)',
            display: (this.state.visible) ? 'block' : 'none',
          }}
          ref={c => { this.resizable = c; }}
          enable={{ top: true }}
          onResizeStart={this.handleResizeStart}
          onResizeStop={this.handleResizeStop}
        >
          <div className={style.consoleView}>
            <ConsoleHandler
              content={this.props.logs}
            />
          </div>
        </Resizable>
      </div>
    );
  }
}

export default Console;
