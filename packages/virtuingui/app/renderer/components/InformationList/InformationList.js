import React, { Component } from 'react';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem'
import ListSubheader from '@material-ui/core/ListSubheader'
import ListItemText from '@material-ui/core/ListItemText'

class InformationList extends Component {
  static propTypes = {
    data: PropTypes.objectOf(PropTypes.string).isRequired
  };

  render() {
    return (
      <List>
        <ListSubheader>
          <span>Key</span>
          <span>Details</span>
        </ListSubheader>
        {Object.keys(this.props.data).map((key) => (
          <ListItem key={key}>
            <ListItemText disableTypography primary={key} />
            <ListItemText disableTypography primary={this.props.data[key]} />
          </ListItem>
        ))}
      </List>
    );
  }
}
export default InformationList;
