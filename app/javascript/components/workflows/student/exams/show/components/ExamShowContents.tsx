import React, { useEffect, useContext } from 'react';
import {
  ExamVersion,
} from '@student/exams/show/types';
import { createMap } from '@student/exams/show/files';
import { ExamContext, RailsContext, ExamFilesContext } from '@student/exams/show/context';
import useAnomalyListeners from '@student/exams/show/lockdown/anomaly';
import HTML from '@student/exams/show/components/HTML';
import { Row, Col } from 'react-bootstrap';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import ShowQuestion from '@student/exams/show/containers/ShowQuestion';

interface ExamShowContentsProps {
  exam: ExamVersion;
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
      <ExamFilesContext.Provider value={{ references: reference }}>
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
      </ExamFilesContext.Provider>
    </ExamContext.Provider>
  );
};

export default ExamShowContents;
