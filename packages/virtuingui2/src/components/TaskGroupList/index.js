import { connect } from 'react-redux';
import TaskGroupList from './TaskGroupList';

const mapDispatchToProps = (dispatch) => ({
})

const mapStateToProps = (state, ownProps) => {
  console.log(state)
  return ({
    groups: state.virtuin.groups
  });
}

export default connect(mapStateToProps, mapDispatchToProps)(TaskGroupList);