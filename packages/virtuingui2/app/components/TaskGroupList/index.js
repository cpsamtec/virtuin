import { connect } from 'react-redux';
import TaskGroupList from './TaskGroupList';

import { VirtuinSagaActions } from '../../redux/Virtuin';


const mapDispatchToProps = (dispatch) => ({
  resetGroup: (groupIndex) => dispatch(VirtuinSagaActions.resetGroup(groupIndex))
})

const mapStateToProps = (state, ownProps) => {
  return ({
    groups: state.virtuin.groups,
  });
}

export default connect(mapStateToProps, mapDispatchToProps)(TaskGroupList);