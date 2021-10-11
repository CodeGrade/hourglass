import { connect } from 'react-redux';
import { MSTP, MDTP } from '@student/exams/show/types';
import Scratch from '@student/exams/show/components/navbar/Scratch';
import { updateScratch } from '@student/exams/show/actions';

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
