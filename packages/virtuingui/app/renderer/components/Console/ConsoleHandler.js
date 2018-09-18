import React, { Component } from 'react';
import PropTypes from 'prop-types';

import style from './ConsoleHandler.scss';
import ConsoleMessage from './ConsoleMessage';

class ConsoleHandler extends Component {
  static propTypes = {
    content: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string,
      data: PropTypes.string,
      timestamp: PropTypes.string
    })).isRequired
  };

  constructor() {
    super();
    this.flag = {
      fixedToBottom: true
    };
  }

  componentDidUpdate = () => {
    if (this.flag.fixedToBottom) {
      this.scrollView.scrollTop = this.scrollView.scrollHeight;
    }
  }

  handleScroll = () => {
    // Auto-scroll when it is near bottom
    const heightDiff = this.scrollView.scrollHeight - this.scrollView.clientHeight - 60;
    this.flag.fixedToBottom = (this.scrollView.scrollTop >= heightDiff);
  }

  render() {
    return (
      <div
        onScroll={this.handleScroll}
        ref={(ref) => { this.scrollView = ref; }}
        className={style.console}
      >
        <table className={style.consoleData}>
          <tbody>
            {this.props.content.map((message) =>
              <ConsoleMessage message={message} key={`${message.id}`} />
            )}
            <tr className={style.fillRemainder}>
              <td className={style.timestamp} />
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default ConsoleHandler;
