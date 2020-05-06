import React from 'react';
import {
  ExamNavbar,
  RegularNavbar,
} from '@hourglass/components/navbar';
import { useExamInfoContext } from '@hourglass/context';
import ExamShowContents from '@hourglass/containers/ExamShowContents';
import PreStart from '@hourglass/containers/PreStart';

interface ExamTakerProps {
  ready: boolean;
}

const ExamTaker: React.FC<ExamTakerProps> = (props) => {
  const {
    ready,
  } = props;
  const {
    railsExam,
    railsUser,
  } = useExamInfoContext();
  const body = ready ? (
    <>
      <ExamNavbar />
      <ExamShowContents
        railsExam={railsExam}
      />
    </>
  ) : (
    <>
      <RegularNavbar
        railsUser={railsUser}
      />
      <PreStart
        railsExam={railsExam}
      />
    </>
  );
  return (
    <div>
      {body}
    </div>
  );
};
export default ExamTaker;
