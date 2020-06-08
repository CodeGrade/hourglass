import { connect } from 'react-redux';
import { MSTP } from '@professor/exams/new/types';
import { Version } from '@hourglass/common/api/professor/exams/versions/update';
import Submit from '@professor/exams/new/editor/components/Submit';

const mapStateToProps: MSTP<{
  version: Version;
}> = (state) => ({
  version: {
    info: {
      contents: {
        instructions: state.contents.exam.instructions,
        questions: state.contents.exam.questions,
        reference: state.contents.exam.reference,
      },
      policies: state.railsExam.policies,
      answers: state.contents.answers.answers,
    },
    files: state.contents.exam.files,
  },
});

export default connect(mapStateToProps)(Submit);
