import React from "react";
import { useExamState, ExamContextProvider } from "./examstate";
import { Question } from "./Question";
import { FileViewer } from "./FileViewer";
import { HTML } from "./questions/HTML";
import { Container } from 'react-bootstrap';
import { createMap } from './files';

interface ExamTakerProps {
  exam: ExamInfo;
}

function ExamTaker(props: ExamTakerProps) {
  const { exam } = props;
  const { files, info } = exam;
  const { questions, instructions, reference } = info;
  const fmap = createMap(files);
  const { getAtPath, dispatch } = useExamState(files, info, fmap);
  return (
    <Container>
      <ExamContextProvider value={{ dispatch, getAtPath, files, fmap }}>
        <div><HTML value={instructions} /></div>
        {reference && <FileViewer references={reference} />}
        <div>
          {questions.map((q, i) => (
            <Question question={q} qnum={i} key={i} />
          ))}
        </div>
      </ExamContextProvider>
    </Container>
  );
}

export default ExamTaker;
