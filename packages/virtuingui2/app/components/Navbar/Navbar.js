import React from 'react';
import ReactSVG from 'react-svg';
import styled from '@emotion/styled';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Navigation from '../../assets/svgs/navigation.svg';
console.log('Navigation', Navigation);
import CircleButton from '../CircleButton';

const Nav = styled(AppBar)`
  height: 80px;
  padding: 0 30px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #333;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Spacer = styled.div`
  width: 16px;
`;


const Navbar = ({ show, task, toggleSidebar }) => (
  <Nav position="relative">
    <Row>
      {!show && 
        <>
          <CircleButton fullWhite onClick={toggleSidebar}>
            <Navigation />
          </CircleButton>
          <Spacer/>
        </>
      }
      <Typography variant="h6">Task Name 0</Typography>
    </Row>
    
  </Nav>
);

export default Navbar;