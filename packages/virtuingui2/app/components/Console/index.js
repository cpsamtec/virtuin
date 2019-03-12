import { connect } from 'react-redux';
import getCurrentTask from '../../selectors/currentTask';
import Console from './Console';


const mapDispatchToProps = (dispatch) => ({
})

const mapStateToProps = (state, ownProps) => {
  const currentTask = getCurrentTask(state);
  return ({
    messages: currentTask != null ? currentTask.messages : null,
    stdout: currentTask != null ? currentTask.stdout : null,
    stderr: currentTask != null ? currentTask.stderr : null,
    error: currentTask != null ? currentTask.error : null,
    developerMode: state.collection.build != null && state.collection.build === 'development'
  });
}

export default connect(mapStateToProps, mapDispatchToProps)(Console);