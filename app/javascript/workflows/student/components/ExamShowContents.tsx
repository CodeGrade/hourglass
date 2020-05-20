import React, { useEffect, useContext } from 'react';
import {
  Exam,
} from '@student/types';
import { createMap } from '@student/files';
import { ExamContext, RailsContext } from '@student/context';
import useAnomalyListeners from '@student/lockdown/anomaly';
import HTML from '@student/components/HTML';
import { Row, Col } from 'react-bootstrap';
import { FileViewer } from '@student/components/FileViewer';
import ShowQuestion from '@student/containers/ShowQuestion';

interface ExamShowContentsProps {
  exam: Exam;
  save: () => void;
}

const INTERVAL = 10000;

const ExamShowContents: React.FC<ExamShowContentsProps> = (props) => {
  const {
    exam,
    save,
  } = props;
  useEffect(() => {
    const timer: number = window.setInterval(() => save(), INTERVAL);
    return (): void => {
      clearInterval(timer);
    };
  }, [save]);
  useAnomalyListeners();
  const {
    questions,
    instructions,
    reference,
    files,
  } = exam;
  const fmap = createMap(files);
  const { railsExam } = useContext(RailsContext);
  return (
    <ExamContext.Provider value={{ files, fmap }}>
      <h1>{railsExam.name}</h1>
      <HTML value={instructions} />
      {reference && <FileViewer references={reference} />}
      <Row>
        <Col>
          {questions.map((q, i) => (
            <ShowQuestion
              // Question numbers are STATIC.
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              question={q}
              qnum={i}
              lastQuestion={i === questions.length - 1}
            />
          ))}
        </Col>
      </Row>
    </ExamContext.Provider>
  );
};

export default ExamShowContents;
