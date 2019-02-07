import React from 'react';
import styled from '@emotion/styled/macro';
import Chip from '@material-ui/core/Chip';


const colorSelector = (color) => {
  const colors = {
    alert: '#DC3519',
    error: '#DC3519',
    info: '#19B3DC',
    warn: '#EBED1F',
    success: '#19DC49'
  }
  return colors[color] ? colors[color] : '#999';
}
export const OutlinedChip = styled(Chip)`
  color: ${props => colorSelector(props.color)};
  border-color: ${props => colorSelector(props.color)};
`;
const OutlinedChipComponent = ({label, color}) => (
  <OutlinedChip variant="outlined" color={color} label={label} />
);

export default OutlinedChipComponent;