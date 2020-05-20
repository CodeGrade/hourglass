import React from 'react';
import { RailsExam, ContentsState } from '@examTaker/types';
import HTML from '@examTaker/components/HTML';
import { ExamContext, ExamViewerContext, RailsContext } from '@examTaker/context';
import { createMap } from '@examTaker/files';
import DisplayQuestions from '@examTaker/components/DisplayQuestions';
import { FileViewer } from '@examTaker/components/FileViewer';
import Scratch from '@examTaker/components/navbar/Scratch';

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
