import React from 'react';
import {
  ExamInfo,
  User,
} from '@hourglass/types';
import {
  ExamNavbar,
  RegularNavbar,
} from '@hourglass/components/navbar';
import ExamShowContents from '@hourglass/containers/ExamShowContents';
import PreStart from '@hourglass/containers/PreStart';

interface ExamTakerProps {
  loaded: boolean;
  exam: ExamInfo;
  preview: boolean;
  user: User;
}

const ExamTaker: React.FC<ExamTakerProps> = (props) => {
  const {
    loaded,
    exam,
    preview,
    user,
  } = props;
  if (loaded) {
    return (
      <div>
        <ExamNavbar
          user={user}
          preview={preview}
          locked={loaded}
        />
        <ExamShowContents
          exam={exam}
          preview={preview}
        />
      </div>
    );
  }
  return (
    <div>
      <RegularNavbar user={user} />
      <h1>{exam.name}</h1>
      <PreStart
        examID={exam.id}
        preview={preview}
      />
    </div>
  );
}
export default ExamTaker;
