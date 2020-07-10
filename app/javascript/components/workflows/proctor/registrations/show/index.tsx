import React, { useMemo } from 'react';
import { ContentsState } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import {
  ExamContext,
  ExamViewerContext,
  ExamFilesContext,
} from '@student/exams/show/context';
import { createMap } from '@student/exams/show/files';
import DisplayQuestions from '@proctor/registrations/show/DisplayQuestions';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import Scratch from '@student/exams/show/components/navbar/Scratch';

interface ExamViewerProps {
  contents: ContentsState;
  refreshCodeMirrorsDeps: React.DependencyList;
}

const ExamViewer: React.FC<ExamViewerProps> = (props) => {
  const {
    contents,
    refreshCodeMirrorsDeps,
  } = props;
  const {
    exam,
    answers,
  } = contents;
  const {
    instructions,
    files,
    reference,
    questions,
  } = exam;
  const examContextVal = useMemo(() => ({
    files,
    fmap: createMap(files),
  }), [files]);
  const examViewerContextVal = useMemo(() => ({
    answers,
  }), [answers]);
  const examFilesContextVal = useMemo(() => ({
    references: reference,
  }), [reference]);
  return (
    <ExamContext.Provider value={examContextVal}>
      <ExamViewerContext.Provider value={examViewerContextVal}>
        <ExamFilesContext.Provider value={examFilesContextVal}>
          <div>
            {answers.scratch && (
              <div>
                <span>Scratch space:</span>
                <Scratch
                  value={answers.scratch}
                  disabled
                />
              </div>
            )}
            {instructions && <HTML value={instructions} />}
            {reference.length !== 0 && (
              <FileViewer
                refreshProps={refreshCodeMirrorsDeps}
                references={reference}
              />
            )}
            <div>
              <DisplayQuestions
                refreshCodeMirrorsDeps={refreshCodeMirrorsDeps}
                questions={questions}
              />
            </div>
          </div>
        </ExamFilesContext.Provider>
      </ExamViewerContext.Provider>
    </ExamContext.Provider>
  );
};

export default ExamViewer;
