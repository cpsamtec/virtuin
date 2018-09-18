import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import InformationTables from '../../containers/InformationTables';
import Section from '../Section/Section';
import TaskInterface from '../TaskInterface/TaskInterface';

export default class DetailTaskView extends Component {

  static propTypes = {
    taskDetails: PropTypes.shape({
      viewURL: PropTypes.string
    }).isRequired
  };

  state = {
    displayTaskView: false
  };

  webView = {};
  scrollView = {};
  infoTables = {};

  render() {
    let viewURL;
    if (this.props.taskDetails && typeof this.props.taskDetails.viewURL === 'string') {
      ({ viewURL } = this.props.taskDetails);
    } else {
      viewURL = undefined;
    }
    return (
      <Grid
        container
        spacing={0}
      >
        <InformationTables
          ref={(infoTables) => { this.infoTables = infoTables; }}
        />
        <Grid item xs={12}>
          <Section
            title="Detail View"
          >
            {viewURL ? <TaskInterface viewURL={viewURL} /> : null}
          </Section>
        </Grid>
      </Grid>
    );
  }
}
