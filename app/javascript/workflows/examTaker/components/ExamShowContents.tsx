import React, { useEffect, useContext } from 'react';
import {
  Exam,
} from '@examTaker/types';
import { createMap } from '@examTaker/files';
import { ExamContext, RailsContext } from '@examTaker/context';
import useAnomalyListeners from '@examTaker/lockdown/anomaly';
import HTML from '@examTaker/components/HTML';
import { Row, Col } from 'react-bootstrap';
import { FileViewer } from '@examTaker/components/FileViewer';
import ShowQuestion from '@examTaker/containers/ShowQuestion';

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
