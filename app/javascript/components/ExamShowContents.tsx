import React, { useEffect } from 'react';
import {
  ExamState,
} from '@hourglass/types';
import { createMap } from '@hourglass/files';
import { ExamContextProvider } from '@hourglass/context';
import Questions from '@hourglass/containers/Questions';
import useAnomalyListeners from '@hourglass/lockdown/anomaly';
import HTML from '@hourglass/components/HTML';
import { FileViewer } from './FileViewer';

interface ExamShowContentsProps {
  examState: ExamState;
  save: () => void;
  preview: boolean;
}

const INTERVAL = 10000;

const ExamShowContents: React.FC<ExamShowContentsProps> = (props) => {
  const {
    examState,
    save,
    preview,
  } = props;
  const {
    info,
    files,
  } = examState;
  useEffect(() => {
    let timer: number;
    if (!preview) {
      timer = window.setInterval(() => save(), INTERVAL);
    }
    return (): void => {
      if (timer) clearInterval(timer);
    };
  }, [save, preview]);
  useAnomalyListeners(preview);
  const {
    questions,
    instructions,
    reference,
  } = info;
  const fmap = createMap(files);
  return (
    <ExamContextProvider value={{ files, fmap }}>
      <div>
        <HTML value={instructions} />
        {reference && <FileViewer references={reference} />}
        <div>
          <Questions questions={questions} />
        </div>
      </div>
    </ExamContextProvider>
  );
};

export default ExamShowContents;
