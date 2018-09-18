import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TableMui from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

class Table extends Component {
  static propTypes = {
    columnNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  render() {
    const tableRows = [];
    const { columnNames } = this.props;
    this.props.data.forEach((rowData) => {
      // for (const rowData of this.props.data) {
      const row = Array.from(columnNames, columnName => {
        const columnValue = columnName in rowData ? rowData[columnName] : '--';
        return (
          <TableCell key={`${this.props.data[0][this.props.columnNames[0]]}${columnName}`}>
            {columnValue}
          </TableCell>
        );
      });
      tableRows.push(row);
    });

    return (
      <TableMui>
        <TableHead>
          <TableRow>
            {
              this.props.columnNames.map((columnName) => (
                <TableCell key={`${columnName}Header`}>{columnName}</TableCell>
              ))
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {tableRows.map((row, index) => (
            <TableRow key={`${this.props.data[index][this.props.columnNames[0]]}Row`}>
              {row.map((cell) => (
                cell
              ))}
            </TableRow>
            ))}
        </TableBody>
      </TableMui>
    );
  }
}

export default Table;


/*

 */
