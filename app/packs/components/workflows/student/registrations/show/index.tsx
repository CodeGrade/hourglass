import React, { useMemo } from 'react';
import { AnswersState, ExamFile } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import {
  ExamContext,
  ExamViewerContext,
  ExamFilesContext,
} from '@hourglass/common/context';
import { createMap } from '@student/exams/show/files';
import DisplayQuestions from '@student/registrations/show/DisplayQuestions';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import Scratch from '@student/exams/show/components/navbar/Scratch';
import { CurrentGrading } from '@professor/exams/types';
import { useFragment } from 'relay-hooks';
import { graphql } from 'relay-runtime';

import { showExamViewerStudent$key } from './__generated__/showExamViewerStudent.graphql';

interface ExamViewerProps {
  version: showExamViewerStudent$key;
  currentGrading?: CurrentGrading;
  currentAnswers: AnswersState;
  refreshCodeMirrorsDeps?: React.DependencyList;
  overviewMode: boolean;
}

const ExamViewerStudent: React.FC<ExamViewerProps> = (props) => {
  const {
    version,
    currentGrading,
    currentAnswers,
    refreshCodeMirrorsDeps,
    overviewMode,
  } = props;
  const res = useFragment(
    graphql`
    fragment showExamViewerStudent on ExamVersion {
      id
      ...DisplayQuestions
      dbReferences {
        type
        path
      }
      instructions {
        type
        value
      }
      files
    }
    `,
    version,
  );
  const {
    instructions,
    dbReferences: references,
    files,
  } = res;
  const examContextVal = useMemo(() => ({
    files: files as ExamFile[],
    fmap: createMap(files as ExamFile[]),
  }), [files]);
  const examViewerContextVal = useMemo(() => ({
    answers: currentAnswers,
    rubric: null,
  }), [currentAnswers]);
  const examFilesContextVal = useMemo(() => ({
    references,
  }), [references]);
  return (
    <ExamContext.Provider value={examContextVal}>
      <ExamViewerContext.Provider value={examViewerContextVal}>
        <ExamFilesContext.Provider value={examFilesContextVal}>
          <div>
            {currentAnswers.scratch && (
              <div>
                <span>Scratch space:</span>
                <Scratch
                  value={currentAnswers.scratch}
                  disabled
                />
              </div>
            )}
            {instructions && <HTML value={instructions} />}
            {references.length !== 0 && (
              <FileViewer
                refreshProps={refreshCodeMirrorsDeps}
                references={references}
              />
            )}
            <div>
              <DisplayQuestions
                refreshCodeMirrorsDeps={refreshCodeMirrorsDeps}
                version={res}
                currentGrading={currentGrading}
                fullyExpandCode
                overviewMode={overviewMode}
              />
            </div>
          </div>
        </ExamFilesContext.Provider>
      </ExamViewerContext.Provider>
    </ExamContext.Provider>
  );
};

export default ExamViewerStudent;
