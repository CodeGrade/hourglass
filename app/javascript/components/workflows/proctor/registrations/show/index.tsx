import React from 'react';
import { RailsExam, ContentsState } from '@student/exams/show/types';
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
  railsExam: RailsExam;
  contents: ContentsState;
}

const ExamViewer: React.FC<ExamViewerProps> = (props) => {
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
  const fmap = createMap(files);
  return (
    <ExamContext.Provider value={{ files, fmap }}>
      <ExamViewerContext.Provider value={{ answers }}>
        <RailsContext.Provider value={{ railsExam }}>
          <ExamFilesContext.Provider value={{ references: reference }}>
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
              {reference && <FileViewer references={reference} />}
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
};

export default ExamViewer;
