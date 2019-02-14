import styled from '@emotion/styled';
import MuiListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

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

export const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  & > * {
    margin-right: 15px;
  }
  & > *:last-child {
    margin-right: 0;
  }
`;

export const Line = styled.div`
  margin: 0 15px;
  flex-grow: 1;
  border-bottom: solid 1px #555;
`;

export const ToggleButton = styled(IconButton)`
  width: 18px;
  height: 18px;
  margin-right: 5px;
  padding: 0;
`