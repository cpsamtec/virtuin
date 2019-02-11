import { connect } from 'react-redux';
import { createSelector } from 'reselect'
import { toggleSidebar } from '../../redux/Sidebar';
import Navbar from './Navbar';



const getTaskIdentifier = state => state.taskView.identifier;
const getTaskGroup = state => state.virtuin.groups;

const getCurrentTask = createSelector(
  [getTaskIdentifier, getTaskGroup], 
  ({groupIndex, taskIndex}, taskGroup) => taskGroup[groupIndex].tasksStatus[taskIndex]
)

const mapDispatchToProps = dispatch => ({
  toggleSidebar: () => dispatch(toggleSidebar())
});

const mapStateToProps = (state, ownProps) => {
  return {
    show: state.sidebar.show,
    taskView: getCurrentTask(state)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Navbar);
