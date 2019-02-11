import styled from '@emotion/styled';
import Drawer from '@material-ui/core/Drawer';

export const SidebarDrawer = styled(Drawer, {shouldForwardProp: prop => prop !== 'show'})`
  width: 350px;
  margin-left: ${props => props.show ? '0' : '-350px'};
  transition:  margin-left 300ms ease;
  position: relative;
  overflow: visible;
`;
export const Header = styled.div`
  width: 100%;
  height: 80px;
  padding: 15px;
  background: #F39952;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const Logo = styled.img`
  height: 45px;
`;
