import React from 'react';
import { examStore } from '../store';
import { ExamInfo } from '../types';
import { Question } from './Question';
import { FileViewer } from './FileViewer';
import { HTML } from './questions/HTML';
import { Container } from 'react-bootstrap';
import { Provider } from 'react-redux';
import { ExamContextProvider } from '../context';
import { createMap } from '../files';

interface ExamTakerProps {
  exam: ExamInfo;
}

function ExamTaker(props: ExamTakerProps) {
  const { exam } = props;
  const { files, info } = exam;
  const fmap = createMap(files);
  const { questions, instructions, reference } = info;
  const store = examStore(files, info);
  return (
    <Container>
      <ExamContextProvider value={{ files, fmap }}>
        <Provider store={store}>
          <div><HTML value={instructions} /></div>
          {reference && <FileViewer references={reference} />}
          <div>
            {questions.map((q, i) => (
              <Question question={q} qnum={i} key={i} />
            ))}
          </div>
        </Provider>
      </ExamContextProvider>
    </Container>
  );
}

export default ExamTaker;
