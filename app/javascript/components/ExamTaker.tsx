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
    exam,
    preview,
    user,
  } = useExamInfoContext();
  const body = ready ? (
    <>
      <ExamNavbar
        user={user}
        preview={preview}
      />
      <ExamShowContents
        exam={exam}
        preview={preview}
      />
    </>
  ) : (
    <>
      <RegularNavbar
        user={user}
      />
      <PreStart
        preview={preview}
        exam={exam}
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
