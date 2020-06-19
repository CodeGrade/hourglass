import { connect } from 'react-redux';
import ExamNavbar from '@student/exams/show/components/navbar';
import { MSTP, TimeInfo } from '@student/exams/show/types';

const mapStateToProps: MSTP<{
  time: TimeInfo;
}> = (state) => ({
  time: state.contents.time,
});

const ExamNavbarConnected = connect(mapStateToProps)(ExamNavbar);
ExamNavbarConnected.displayName = 'ExamNavbarConnected';
export default ExamNavbarConnected;
ExamNavbar.whyDidYouRender = true;
