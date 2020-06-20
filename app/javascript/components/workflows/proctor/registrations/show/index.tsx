import React from 'react';
import { RailsExamVersion, ContentsState } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import {
  ExamContext,
  ExamViewerContext,
  RailsContext,
  ExamFilesContext,
} from '@student/exams/show/context';
import { createMap } from '@student/exams/show/files';
import DisplayQuestions from '@proctor/registrations/show/DisplayQuestions';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import Scratch from '@student/exams/show/components/navbar/Scratch';

interface ExamViewerProps {
  railsExam: RailsExamVersion;
  contents: ContentsState;
}

const ExamViewer: React.FC<ExamViewerProps> = React.memo((props) => {
  const {
    railsExam,
    contents,
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
  const fmap = React.useMemo(() => createMap(files), [files]);
  const examContext = React.useMemo(() => ({ files, fmap }), [files, fmap]);
  const examFilesContext = React.useMemo(() => ({ references: reference }), [reference]);
  const examViewerContext = React.useMemo(() => ({ answers }), [answers]);
  const railsContext = React.useMemo(() => ({ railsExam }), [railsExam]);
  return (
    <ExamContext.Provider value={examContext}>
      <ExamViewerContext.Provider value={examViewerContext}>
        <RailsContext.Provider value={railsContext}>
          <ExamFilesContext.Provider value={examFilesContext}>
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
              <HTML value={instructions} />
              {reference.length !== 0 && <FileViewer references={reference} />}
              <div>
                <DisplayQuestions
                  questions={questions}
                />
              </div>
            </div>
          </ExamFilesContext.Provider>
        </RailsContext.Provider>
      </ExamViewerContext.Provider>
    </ExamContext.Provider>
  );
}, (prev, next) => (
  prev.contents === next.contents
  && prev.railsExam.id === next.railsExam.id
  && prev.railsExam.name === next.railsExam.name
  && prev.railsExam.policies === next.railsExam.policies
));

export default ExamViewer;
