import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Provider } from 'react-redux';
import { examStore } from '@hourglass/store';
import { ExamInfo, User } from '@hourglass/types';
import { Question } from './Question';
import { FileViewer } from './FileViewer';
import { HTML } from './questions/HTML';
import { ExamContextProvider } from '@hourglass/context';
import { createMap } from '@hourglass/files';
import { ExamNavbar } from '@hourglass/components/navbar';

interface ExamTakerProps {
  // Whether the exam is in "preview" mode.
  preview: boolean;

  user: User;

  exam: ExamInfo;
}

function ExamTaker(props: ExamTakerProps) {
  const {
    exam,
    preview,
    user,
  } = props;
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
          <ExamNavbar
            user={user}
            preview={preview}
          />
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
