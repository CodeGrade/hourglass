import React from 'react';
import { RailsExam, ExamContents, AnswersState } from '@hourglass/types';
import HTML from '@hourglass/components/HTML';

interface ExamViewerProps {
  info: RailsExam;
  contents: {
    exam: ExamContents;
    answers: AnswersState;
  };
}

const ExamViewer: React.FC<ExamViewerProps> = (props) => {
  const {
    contents,
  } = props;
  const {
    exam,
  } = contents;
  const {
    instructions,
  } = exam;
  return (
    <div>
      <HTML value={instructions} />
      <p>TODO: ExamViewer</p>
    </div>
  );
};

export default ExamViewer;
