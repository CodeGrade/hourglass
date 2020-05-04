import React, { useState, useEffect } from 'react';
import {
  ExamState,
  ExamInfo,
} from '@hourglass/types';
import { HTML } from './questions/HTML';
import { FileViewer } from './FileViewer';
import { Question } from './Question';
import { createMap } from '@hourglass/files';
import { ExamContextProvider } from '@hourglass/context';

interface ExamShowContentsProps {
  exam: ExamInfo;
  examState: ExamState;
  save: () => void;
  preview: boolean;
}

const INTERVAL = 10000;

export default function ExamShowContents(props: ExamShowContentsProps) {
  const {
    examState,
    exam,
    save,
    preview,
  } = props;
  const { id } = exam;
  const {
    info,
    files,
  } = examState;
  useEffect(() => {
    if (!preview) {
      const timer = setInterval(() => save(), INTERVAL);
      return () => {
        clearInterval(timer);
      };
    }
  }, [save, preview]);
  const {
    questions,
    instructions,
    reference,
  } = info;
  const fmap = createMap(files);
  return (
    <ExamContextProvider value={{ id, files, fmap }}>
      <div>
        <HTML value={instructions} />
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
      </div>
    </ExamContextProvider>
  );
}
