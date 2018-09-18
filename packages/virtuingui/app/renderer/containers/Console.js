// @flow
import { connect } from 'react-redux';
import Console from '../components/Console/Console';


const mapStateToProps = state => {
  const logs = state.log.logs;
  return {
    logs
  };
};

// eslint-disable-next-line
const mapDispatchToProps = dispatch => {
  return {};
};

// $FlowFixMe
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Console);
