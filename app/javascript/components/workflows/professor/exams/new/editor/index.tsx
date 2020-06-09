import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import store from '@professor/exams/new/store';
import { createMap } from '@student/exams/show/files';
import { ExamContext } from '@student/exams/show/context';
import {
  Exam,
  RailsExam,
  AnswersState,
} from '@student/exams/show/types';
import ExamEditor from '@professor/exams/new/editor/containers/ExamEditor';
import { loadExam } from '@professor/exams/new/actions';

export interface ExamEditorProps {
  exam: Exam;
  railsExam: RailsExam;
  answers: AnswersState;
}

const Editor: React.FC<ExamEditorProps> = (props) => {
  const {
    railsExam,
    exam,
    answers,
  } = props;
  const {
    files,
  } = exam;
  const fmap = createMap(files);

  return (
    <ExamContext.Provider value={{ files, fmap }}>
      <Provider
        store={store({
          contents: {
            exam,
            answers,
          },
          railsExam,
        })}
      >
        <ExamEditor />
      </Provider>
    </ExamContext.Provider>
  );
};
export default Editor;
