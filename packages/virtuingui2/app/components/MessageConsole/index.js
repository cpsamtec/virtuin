import { connect } from 'react-redux';
import getCurrentTask from '../../selectors/currentTask';
import MessageConsole from './MessageConsole';


const mapDispatchToProps = (dispatch) => ({
})

const mapStateToProps = (state, ownProps) => {
  const currentTask = getCurrentTask(state);
  return ({
    messages: currentTask != null ? currentTask.messages : null
  });
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageConsole);