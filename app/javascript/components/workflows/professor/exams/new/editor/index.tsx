import React from 'react';
import { Provider } from 'react-redux';
import createStore from '@professor/exams/new/store';
import { createMap } from '@student/exams/show/files';
import { ExamContext } from '@student/exams/show/context';
import {
  ExamVersion,
  RailsExamVersion,
  AnswersState,
} from '@student/exams/show/types';
import ExamEditor from '@professor/exams/new/editor/containers/ExamEditor';
import { ExamEditorState } from '../types';

export interface ExamEditorProps {
  exam: ExamVersion;
  railsExamVersion: RailsExamVersion;
  answers: AnswersState;
}

const Editor: React.FC<ExamEditorProps> = (props) => {
  const {
    railsExamVersion,
    exam,
    answers,
  } = props;
  const {
    files,
  } = exam;
  const fmap = createMap(files);

  const init: ExamEditorState = {
    contents: {
      exam,
      answers,
    },
    name: railsExamVersion.name,
    policies: railsExamVersion.policies,
  };

  const store = createStore(init);

  return (
    <ExamContext.Provider value={{ files, fmap }}>
      <Provider store={store}>
        <ExamEditor />
      </Provider>
    </ExamContext.Provider>
  );
};
export default Editor;
