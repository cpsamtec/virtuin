import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Table from '../Table/Table';
import Section from '../Section/Section';
import InformationList from '../InformationList/InformationList';

class InformationTables extends Component {
  static propTypes = {
    specs: PropTypes.arrayOf(PropTypes.shape({
      details: PropTypes.string,
      lsl: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      usl: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string
    })).isRequired,
    serialNumber: PropTypes.string.isRequired,
    partNumber: PropTypes.string.isRequired
  };

  render() {
    const { specs } = this.props;
    const specsCol = ['name', 'lsl', 'usl', 'details'];
    return (
      <Grid container spacing={0}>
        <Grid item xs={4}>
          <Section title="General Information" >
            <InformationList
              data={{ serialNumber: this.props.serialNumber, partNumber: this.props.partNumber }}
            />
          </Section>
        </Grid>
        <Grid item xs={8}>
          <Section title="Task Specifications" >
            <Table data={specs} columnNames={specsCol} />
          </Section>
        </Grid>
      </Grid>
    );
  }
}
export default InformationTables;
