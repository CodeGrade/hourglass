import { connect } from 'react-redux';
import ProfMessages from '@hourglass/components/navbar/ProfMessages';
import { MSTP, ProfMessage } from '@hourglass/types';

const mapStateToProps: MSTP<{
  messages: ProfMessage[];
}> = (state) => ({
  messages: state.messages,
});

export default connect(mapStateToProps)(ProfMessages);
