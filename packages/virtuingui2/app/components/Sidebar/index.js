import { connect } from 'react-redux';
import { toggleSidebar } from '../../redux/Sidebar';
import Sidebar from './Sidebar';

const mapDispatchToProps = (dispatch) => ({
  toggleSidebar: () => dispatch(toggleSidebar())
})

const mapStateToProps = (state, ownProps) => {
  return ({
    show: state.sidebar.show
  });
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);