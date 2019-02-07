import React from 'react';
import ReactSVG from 'react-svg'
import { SidebarDrawer, Header, Logo } from './Sidebar.style';
import CircleButton from '../CircleButton';
import Navigation from '../../assets/svgs/navigation.svg';
import SamtecLogo from '../../assets/images/samtecLogoWhite.png';

const SidebarComponent = ({ show, toggleSidebar, children }) => (
  <SidebarDrawer
    variant="persistent"
    anchor="left"
    open
    show={show}
  >
    <Header>
      <Logo src={SamtecLogo} />
      <CircleButton fullWhite onClick={toggleSidebar}>
        <Navigation />
      </CircleButton>
    </Header>
    {children}
  </SidebarDrawer>
)

export default SidebarComponent;