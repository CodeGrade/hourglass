import React from 'react';
import { RailsExam, ContentsState } from '@student/types';
import HTML from '@student/components/HTML';
import { ExamContext, ExamViewerContext, RailsContext } from '@student/context';
import { createMap } from '@student/files';
import DisplayQuestions from '@proctor/registrations/show/DisplayQuestions';
import { FileViewer } from '@student/components/FileViewer';
import Scratch from '@student/components/navbar/Scratch';

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
        </RailsContext.Provider>
      </ExamViewerContext.Provider>
    </ExamContext.Provider>
  );
};

export default ExamViewer;
