import React, { useMemo } from 'react';
import { AnswersState, AnswerState, ExamFile } from '@student/exams/show/types';
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
import { ShowRubricKey } from '@proctor/registrations/show/ShowRubric';
import { useFragment } from 'relay-hooks';
import { graphql } from 'relay-runtime';

import { showExamViewer$key } from './__generated__/showExamViewer.graphql';

interface ExamViewerProps {
  version: showExamViewer$key;
  currentGrading?: CurrentGrading;
  currentAnswers?: AnswersState;
  refreshCodeMirrorsDeps?: React.DependencyList;
  registrationId?: string;
  overviewMode: boolean;
}

const ExamViewer: React.FC<ExamViewerProps> = (props) => {
  const {
    version,
    currentGrading,
    currentAnswers,
    refreshCodeMirrorsDeps,
    registrationId,
    overviewMode,
  } = props;
  const res = useFragment(
    graphql`
    fragment showExamViewer on ExamVersion {
      id
      answers
      ...DisplayQuestions
      rootRubric @include(if: $withRubric) { ...ShowRubricKey } 
      dbReferences {
        type
        path
      }
      instructions {
        type
        value
      }
      dbQuestions {
        id
        rubrics {
          id
        }
        parts {
          id
          rubrics {
            id
          }
          bodyItems {
            id
            rubrics {
              id
            }
          }
        }
      }
      files
      rubrics {
        id
        type
        order
        points
        description {
          type
          value
        }
        rubricPreset {
          id
          direction
          label
          mercy
          presetComments {
            id
            label
            order
            points
            graderHint
            studentFeedback
          }
        }
        subsections {
          id
        }
      }
    }
    `,
    version,
  );
  const {
    instructions,
    dbReferences: references,
    files,
  } = res;
  const answers = overviewMode ? {
    answers: res.answers as AnswerState[][][],
    scratch: '',
  } : currentAnswers;
  const examContextVal = useMemo(() => ({
    files: files as ExamFile[],
    fmap: createMap(files as ExamFile[]),
  }), [files]);
  const examViewerContextVal = useMemo(() => ({
    answers,
  }), [answers]);
  const examFilesContextVal = useMemo(() => ({
    references,
  }), [references]);
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
            {references.length !== 0 && (
              <FileViewer
                refreshProps={refreshCodeMirrorsDeps}
                references={references}
              />
            )}
            {overviewMode && <ShowRubricKey rubricKey={res.rootRubric} forWhat="exam" />}
            <div>
              <DisplayQuestions
                refreshCodeMirrorsDeps={refreshCodeMirrorsDeps}
                version={res}
                currentGrading={currentGrading}
                registrationId={registrationId}
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

export default ExamViewer;
