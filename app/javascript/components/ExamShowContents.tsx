import React, { useEffect } from 'react';
import {
  Exam,
} from '@hourglass/types';
import { createMap } from '@hourglass/files';
import { ExamContext } from '@hourglass/context';
import Questions from '@hourglass/containers/Questions';
import useAnomalyListeners from '@hourglass/lockdown/anomaly';
import HTML from '@hourglass/components/HTML';
import { FileViewer } from './FileViewer';

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
  return (
    <ExamContext.Provider value={{ files, fmap }}>
      <div>
        <HTML value={instructions} />
        {reference && <FileViewer references={reference} />}
        <div>
          <Questions
            questions={questions}
          />
        </div>
      </div>
    </ExamContext.Provider>
  );
};

export default ExamShowContents;
