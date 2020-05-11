import React, { useEffect, useContext } from 'react';
import {
  Exam,
} from '@hourglass/types';
import { createMap } from '@hourglass/files';
import { ExamContext, RailsContext } from '@hourglass/context';
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
  const { railsExam } = useContext(RailsContext);
  return (
    <ExamContext.Provider value={{ files, fmap }}>
      <h1>{railsExam.name}</h1>
      <HTML value={instructions} />
      {reference && <FileViewer references={reference} />}
      <Questions
        questions={questions}
      />
    </ExamContext.Provider>
  );
};

export default ExamShowContents;
