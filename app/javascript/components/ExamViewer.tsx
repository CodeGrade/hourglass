import React from 'react';
import { RailsExam, ContentsData } from '@hourglass/types';
import HTML from '@hourglass/components/HTML';
import { ExamContext, ExamViewerContext, RailsContext } from '@hourglass/context';
import { createMap } from '@hourglass/files';
import DisplayQuestions from '@hourglass/components/DisplayQuestions';
import { FileViewer } from '@hourglass/components/FileViewer';
import Scratch from '@hourglass/components/navbar/Scratch';

interface ExamViewerProps {
  railsExam: RailsExam;
  contents: ContentsData;
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
