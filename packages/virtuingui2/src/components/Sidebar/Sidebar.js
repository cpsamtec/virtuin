import React from 'react';
import ReactSVG from 'react-svg'
import { SidebarDrawer, Header, Logo } from './Sidebar.style';
import CircleButton from '../CircleButton';

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
        <ReactSVG src={require("../../assets/svgs/navigation.svg")}/>
      </CircleButton>
    </Header>
    {children}
  </SidebarDrawer>
)

export default SidebarComponent;