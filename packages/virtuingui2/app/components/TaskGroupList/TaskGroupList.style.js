import styled from '@emotion/styled';
import MuiListItem from '@material-ui/core/ListItem';

export const ListItem = styled(MuiListItem, {shouldForwardProp: prop => prop !== 'active'})`
  background: ${props => props.active ? '#394249' : null };
`;
export const ListItemPrimary = styled.span`
  margin-right: 10px;
`;