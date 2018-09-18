import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Flexbox from 'flexbox-react';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import ArrowDown from '@material-ui/icons/ArrowDropDown';
import ArrowUp from '@material-ui/icons/ArrowDropUp';

import style from './Section.css';

class Section extends Component {
  static propTypes = {
    className: PropTypes.string,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired
  };

  static defaultProps = {
    className: ''
  };

  state = {
    open: true,
  }

  handleArrowClick = () => {
    this.setState({ open: !this.state.open });
  }

  render() {
    return (
      <div style={{ padding: '15px' }} className={this.props.className}>
        <Flexbox
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          className={style.sectionHeader}
        >
          <Typography type="headline">
            {this.props.title}
          </Typography>
          <IconButton
            onClick={this.handleArrowClick}
          >
            {
              this.state.open ?
                <ArrowDown /> :
                <ArrowUp />
            }
          </IconButton>
        </Flexbox>
        <div
          className={style.sectionContent}
          style={{
            height: (this.state.open) ? 'auto' : '0',
          }}
        >
          {this.props.children}
        </div>

      </div>
    );
  }
}

export default Section;
