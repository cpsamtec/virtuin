import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Resizable from 'react-resizable-box';
import TextField from '@material-ui/core/TextField';
import NavIcon from '@material-ui/icons/Menu';
import TaskIcon from '@material-ui/icons/Description';
import HomeIcon from '@material-ui/icons/Home';
import SearchIcon from '@material-ui/icons/Search';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import NavItem from './NavItem';
import style from './SideBar.scss';
import s from './SideBarStyle';
import logo from '../../assets/images/samtecLogoWhite.png';

class SideBar extends Component {
  static propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.object).isRequired
  };

  state={
    isFullWidth: false,
    currentWidth: 250,
    value: '',
  };

  handleResizeStart = () => {
    this.cover.style.display = 'block';
  }

  handleResizeStop = () => {
    this.cover.style.display = 'none';
  }

  toggleFullWidth = () => {
    // this.setState({ isFullWidth: !this.state.isFullWidth });
    // this.setState({ isFullWidth: false });
    // if (this.state.isFullWidth) {
    //   this.setState({ currentWidth: this.resizable.style.width });
    //   this.resizable.updateSize({ width: '80px' });
    // } else {
    //   this.resizable.updateSize({ width: this.state.currentWidth });
    // }
  }
  // 250px
  render() {
    return (
      <Resizable
        width="80px"
        height="100%"
        minWidth={80}
        ref={c => { this.resizable = c; }}
        style={s.resizeContainer}
        enable={{ right: this.state.isFullWidth }}
        onResizeStart={this.handleResizeStart}
        onResizeStop={this.handleResizeStop}
      >
        <div
          className={style.transparentCover}
          ref={(cover) => { this.cover = cover; }}
        />
        <nav className={style.sideBar}>
          <div className={style.logoContainer} style={{ justifyContent: (this.state.isFullWidth) ? 'space-between' : 'center' }}>
            {(this.state.isFullWidth) &&
              <img alt="Samtec Logo" className={style.logo} src={logo} />
            }
            <Button
              onClick={this.toggleFullWidth}
              size="small"
              className={style.navButton}
            >
              <NavIcon />
            </Button>

          </div>
          <div
            className={style.searchArea}
            style={{ justifyContent: (this.state.isFullWidth) ? 'space-between' : 'center' }}
          >
            {(this.state.isFullWidth) &&
              <div className={style.searchInputContainer}>
                <TextField
                  fullWidth
                  placeholder="Search Scripts..."
                />
              </div>
            }
            <Button mini >
              <SearchIcon />
            </Button>
          </div>
          <List>
            <NavItem
              icon={<HomeIcon />}
              title="Home"
              linkTo="/task/"
              isFullWidth={this.state.isFullWidth}
            />
            <NavItem
              icon={<TaskIcon />}
              title="Tasks"
              isFullWidth={this.state.isFullWidth}
            >
              <div className={style.itemLineFirst} />
              {this.props.tasks.map((task) => (
                <div key={task.id} className={style.taskItem}>
                  <div className={style.itemLine} />
                  <Link to={`/task/${task.id}`}>{task.name}</Link>
                </div>
              ))}
            </NavItem>
          </List>
        </nav>
      </Resizable>
    );
  }
}

export default SideBar;
