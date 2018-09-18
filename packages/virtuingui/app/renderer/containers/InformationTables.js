import { connect } from 'react-redux';
import InformationTables from '../components/InformationTables/InformationTables';

const mapStateToProps = (state) => (
  {
    partNumber: state.dut.PartNumber || 'N/A',
    serialNumber: state.dut.SerialNumber || 'N/A',
    specs: state.taskSpecs.specs
  }
);

export default connect(mapStateToProps)(InformationTables);
