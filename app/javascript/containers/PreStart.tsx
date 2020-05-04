import { connect } from 'react-redux';
import PreStart from '@hourglass/components/PreStart';
import { fetchContents } from '@hourglass/actions';

const mapDispatchToProps = (dispatch, ownProps) => {
  const {
    examID,
    preview,
  } = ownProps;
  return {
    onClick: () => {
      dispatch(fetchContents(examID, preview));
    },
  };
}

export default connect(null, mapDispatchToProps)(PreStart);
