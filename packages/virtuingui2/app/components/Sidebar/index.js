import { connect } from 'react-redux';
import { toggleSidebar } from '../../redux/Sidebar';
import { addNotification } from '../../redux/Notifier';
import Sidebar from './Sidebar';

const mapDispatchToProps = (dispatch) => ({
  toggleSidebar: () => dispatch(toggleSidebar()),
  addNotification: (notification) => dispatch(addNotification(notification))
})

const mapStateToProps = (state, ownProps) => {
  return ({
    show: state.sidebar.show
  });
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);