import { connect } from 'react-redux';
import { toggleSidebar } from '../../redux/Sidebar';
import Navbar from './Navbar';

const mapDispatchToProps = dispatch => ({
  toggleSidebar: () => dispatch(toggleSidebar())
});

const mapStateToProps = (state, ownProps) => {
  return {
    show: state.sidebar.show,
    taskView: state.taskView
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Navbar);
