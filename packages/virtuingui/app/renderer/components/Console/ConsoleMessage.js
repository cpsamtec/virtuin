import React, { Component } from 'react';
import PropTypes from 'prop-types';
import style from './ConsoleMessage.scss';

class ConsoleMessage extends Component {
  static propTypes = {
    message: PropTypes.shape({
      type: PropTypes.string,
      data: PropTypes.string,
      timestamp: PropTypes.string
    }).isRequired
  };

  state = {
    dataSource: [], //empty data source for autcomplete
  };

  render() {
    let messageClass = `${style.messageInner} `;
    switch (this.props.message.type) {
      case 'success' :
        messageClass += style.messageSuccess;
        break;
      case 'warn' :
        messageClass += style.messageWarn;
        break;
      case 'error' :
        messageClass += style.messageError;
        break;
      default:
        break;
    }

    const messageEntity = (
      <td className={style.message}>
        <div className={style.messageComponent}>
          <div className={messageClass}>
            {this.props.message.data}
          </div>
        </div>
      </td>
    );

    return (
      <tr className={style.messageContainer} >
        <td className={style.timestamp}>
          <span className={style.timestampText}>{this.props.message.timestamp}</span>
          <div className={style.timestampBorder} />
        </td>
        {messageEntity}
      </tr>
    );
  }
}

export default ConsoleMessage;
