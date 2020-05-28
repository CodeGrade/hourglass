import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import store from '@professor/exams/new/store';
import { createMap } from '@student/exams/show/files';
import { ExamContext } from '@student/exams/show/context';

import ExamEditor from '@professor/exams/new/editor/containers/ExamEditor';
import { ExamEditorProps } from '@professor/exams/new/editor/components/ExamEditor';
import { loadExam } from '@professor/exams/new/actions';

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

  useEffect(() => {
    store.dispatch(loadExam(railsExam, exam, answers));
  }, []);
  return (
    <ExamContext.Provider value={{ files, fmap }}>
      <Provider store={store}>
        <ExamEditor />
      </Provider>
    </ExamContext.Provider>
  );
};
export default Editor;
