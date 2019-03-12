import React from 'react';
import Typography from '@material-ui/core/Typography';
import { SidebarDrawer, Header, Logo } from './Sidebar.style';
import CircleButton from '../CircleButton';
import Navigation from '../../assets/svgs/navigation.svg';
import VirtuinLogo from '../../assets/images/virtuinLogoWhite.png';

const SidebarComponent = ({ show, toggleSidebar, children }) => (
  <SidebarDrawer
    variant="persistent"
    anchor="left"
    open
    show={show}
  >
    <Header>
      <Logo src={VirtuinLogo} />
      <CircleButton fullWhite onClick={toggleSidebar}>
        <Navigation />
      </CircleButton>
    </Header>
    {children}
  </SidebarDrawer>
);

export default SidebarComponent;
