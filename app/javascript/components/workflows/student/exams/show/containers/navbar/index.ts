import { connect } from 'react-redux';
import ExamNavbar from '@student/exams/show/components/navbar';
import { MSTP, TimeInfo } from '@student/exams/show/types';

const mapStateToProps: MSTP<{
  time: TimeInfo;
}> = (state) => ({
  time: state.contents.time,
});

export default connect(mapStateToProps)(ExamNavbar);
