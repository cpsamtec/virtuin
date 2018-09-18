import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ArrowDown from '@material-ui/icons/ArrowDropDown';
import ArrowUp from '@material-ui/icons/ArrowDropUp';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import style from './NavItem.css';

class NavItem extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    children: PropTypes.node,
    isFullWidth: PropTypes.bool.isRequired
  };

  static defaultProps = {
    children: null
  }

  state = {
    open: false,
    storeOpen: false
  };

  componentWillReceiveProps = (nextProps) => {
    // used to keep the store state of open if the navigation bar is full width
    if (this.props.isFullWidth && !nextProps.isFullWidth) {
      const storeOpen = this.state.open;
      this.setState({ open: false, storeOpen });
    } else if (!this.props.isFullWidth && nextProps.isFullWidth) {
      this.setState({ open: this.state.storeOpen });
    }
  }

  toggleOpenState = () => {
    if (!this.props.isFullWidth || !this.props.children) return;
    this.setState({ open: !this.state.open });
  }
  render() {
    const navSecondary = (
      <ListItemIcon>
        {(this.state.open) ?
          <ArrowDown /> :
          <ArrowUp />
        }
      </ListItemIcon>
    );

    return (
      <div>
        <ListItem
          className={
            (this.state.open && this.props.isFullWidth) ?
              style.navItemOpen :
              style.navItem
          }
          button
          style={{
            justifyContent: (this.props.isFullWidth) ? 'normal' : 'center',
          }}
          onClick={this.toggleOpenState}
        >
          <ListItemIcon>{this.props.icon}</ListItemIcon>
          {(this.props.isFullWidth) &&
            <ListItemText primary={this.props.title} />
          }

          {(this.props.children && this.props.isFullWidth) && navSecondary}
        </ListItem>
        {(this.props.children && this.props.isFullWidth) &&
          <div
            className={style.navItemContent}
            style={{ display: (this.state.open ? 'block' : 'none') }}
          >
            {this.props.children}
          </div>
        }
      </div>
    );
  }
}

export default NavItem;
