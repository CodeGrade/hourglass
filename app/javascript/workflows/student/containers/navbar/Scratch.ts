import { connect } from 'react-redux';
import { MSTP, MDTP } from '@student/types';
import Scratch from '@student/components/navbar/Scratch';
import { updateScratch } from '@student/actions';

const mapStateToProps: MSTP<{
  value: string;
}> = (state) => ({
  value: state.contents.answers.scratch ?? '',
});

const mapDispatchToProps: MDTP<{
  onChange: (newVal: string) => void;
}> = (dispatch) => ({
  onChange: (newVal): void => {
    dispatch(updateScratch(newVal));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Scratch);
