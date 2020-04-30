import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Provider } from 'react-redux';
import { examStore } from '../store';
import { ExamInfo } from '../types';
import { Question } from './Question';
import { FileViewer } from './FileViewer';
import { HTML } from './questions/HTML';
import { ExamContextProvider } from '../context';
import { createMap } from '../files';
import SnapshotInfo from '../containers/SnapshotInfo';

interface ExamTakerProps {
  exam: ExamInfo;
}

function ExamTaker(props: ExamTakerProps) {
  const { exam } = props;
  const {
    files,
    info,
    id,
  } = exam;
  const fmap = createMap(files);
  const { questions, instructions, reference } = info;
  const store = examStore();
  return (
    <Container>
      <ExamContextProvider value={{ id, files, fmap }}>
        <Provider store={store}>
          <SnapshotInfo />
          <div><HTML value={instructions} /></div>
          {reference && <FileViewer references={reference} />}
          <div>
            {questions.map((q, i) => (
              <Question
                question={q}
                qnum={i}
                key={i}
              />
            ))}
          </div>
        </Provider>
      </ExamContextProvider>
    </Container>
  );
}

export default ExamTaker;
