import { connect } from 'react-redux';
import getCurrentTask from '../../selectors/currentTask';
import MessageConsole from './MessageConsole';


const mapDispatchToProps = (dispatch) => ({
})

const mapStateToProps = (state, ownProps) => {
  const currentTask = getCurrentTask(state);
  return ({
    messages: currentTask != null ? currentTask.messages : null,
    stdout: currentTask != null ? currentTask.stdout : null,
    stderr: currentTask != null ? currentTask.stderr : null,
    developerMode: state.sidebar.developerMode
  });
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageConsole);