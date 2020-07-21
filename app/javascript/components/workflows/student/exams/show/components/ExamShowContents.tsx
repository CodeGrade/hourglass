import React, { useEffect, useCallback, useMemo } from 'react';
import {
  ExamVersion, Policy,
} from '@student/exams/show/types';
import { createMap } from '@student/exams/show/files';
import { ExamContext, ExamFilesContext } from '@hourglass/common/context';
import useAnomalyListeners from '@student/exams/show/lockdown/anomaly';
import HTML from '@student/exams/show/components/HTML';
import { Row, Col } from 'react-bootstrap';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import ShowQuestion from '@student/exams/show/containers/ShowQuestion';
import { BlockNav } from '@hourglass/workflows';
import { useFragment, graphql } from 'relay-hooks';

import { ExamShowContents$key } from './__generated__/ExamShowContents.graphql';

interface ExamShowContentsProps {
  examKey: ExamShowContents$key;
  exam: ExamVersion;
  save: () => void;
  submit: (cleanup: () => void) => void;
}

const INTERVAL = 10000;

const ExamShowContents: React.FC<ExamShowContentsProps> = (props) => {
  const {
    examKey,
    exam,
    save,
    submit,
  } = props;
  const res = useFragment(
    graphql`
    fragment ExamShowContents on Exam {
      name
      takeUrl
      myRegistration {
        examVersion {
          policies
        }
      }
    }
    `,
    examKey,
  );
  const cleanupBeforeSubmit = useAnomalyListeners(
    res.takeUrl,
    res.myRegistration.examVersion.policies as readonly Policy[],
  );
  const leave = useCallback(() => {
    submit(cleanupBeforeSubmit);
  }, [submit, cleanupBeforeSubmit]);
  useEffect(() => {
    const timer: number = window.setInterval(() => save(), INTERVAL);
    return (): void => {
      clearInterval(timer);
    };
  }, [save]);
  const {
    questions,
    instructions,
    reference,
    files,
  } = exam;
  const examContextVal = useMemo(() => ({
    files,
    fmap: createMap(files),
  }), [files]);
  const examFilesContextVal = useMemo(() => ({
    references: reference,
  }), [reference]);
  return (
    <ExamContext.Provider value={examContextVal}>
      <BlockNav
        onLeave={leave}
        message="Are you sure you want to navigate away? Your exam will be submitted."
        stayText="Stay and continue working"
        leaveText="Leave and submit exam"
      />
      <ExamFilesContext.Provider value={examFilesContextVal}>
        <h1>{res.name}</h1>
        <HTML value={instructions} />
        {reference.length !== 0 && <FileViewer references={reference} />}
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
                examTakeUrl={res.takeUrl}
                cleanupBeforeSubmit={cleanupBeforeSubmit}
              />
            ))}
          </Col>
        </Row>
      </ExamFilesContext.Provider>
    </ExamContext.Provider>
  );
};

export default ExamShowContents;
