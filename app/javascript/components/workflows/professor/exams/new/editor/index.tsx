import React from 'react';
import { Provider } from 'react-redux';
import store from '@professor/exams/new/store';
import { createMap } from '@student/exams/show/files';
import { ExamContext } from '@student/exams/show/context';
import {
  ExamVersion,
  RailsExamVersion,
  AnswersState,
} from '@student/exams/show/types';
import ExamEditor from '@professor/exams/new/editor/containers/ExamEditor';

export interface ExamEditorProps {
  exam: ExamVersion;
  railsExam: RailsExamVersion;
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
