import styled from '@emotion/styled';
import MuiListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';

export const ListItem = styled(MuiListItem, {shouldForwardProp: prop => prop !== 'active'})`
  background: ${props => props.active ? '#394249' : null };
`;
export const ListItemPrimary = styled.span`
  margin-right: 10px;
`;

export const ListItemSecondary = styled(Typography)`
  color: #ccc;
  margin-top: 8px;
  line-height: 1.4;
`;
