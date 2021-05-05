import React, { useMemo } from 'react';
import { AnswerState, ContentsState } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import {
  ExamContext,
  ExamViewerContext,
  ExamFilesContext,
} from '@hourglass/common/context';
import { createMap } from '@student/exams/show/files';
import DisplayQuestions from '@proctor/registrations/show/DisplayQuestions';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import Scratch from '@student/exams/show/components/navbar/Scratch';
import { ExamRubric, CurrentGrading } from '@professor/exams/types';
import ShowRubric from '@proctor/registrations/show/ShowRubric';
import { useFragment } from 'relay-hooks';
import { graphql } from 'relay-runtime';

import { showExamViewer$key } from './__generated__/showExamViewer.graphql';
import convertRubric from '@hourglass/workflows/professor/exams/rubrics';

interface ExamViewerProps {
  version: showExamViewer$key;
  currentGrading?: CurrentGrading;
  refreshCodeMirrorsDeps?: React.DependencyList;
  showRequestGrading?: string;
  showStarterCode: boolean;
}

  // contents: ContentsState;
  // rubric?: ExamRubric;

  // const parsedContents: ContentsState = {
  //   exam: {
  //     questions: res.questions as QuestionInfo[],
  //     reference: res.reference as FileRef[],
  //     instructions: res.instructions as HTMLVal,
  //     files: res.files as ExamFile[],
  //   },
  //   answers: {
  //     answers: res.answers ,
  //     scratch: '',
  //   },
  // };

const ExamViewer: React.FC<ExamViewerProps> = (props) => {
  const {
    version,
    currentGrading,
    refreshCodeMirrorsDeps,
    showRequestGrading,
    showStarterCode,
  } = props;
  const res = useFragment(
    graphql`
    fragment showExamViewer on ExamVersion {
      id
      answers
      ...DisplayQuestions
      dbReferences {
        type
        path
      }
      instructions
      files
      rubrics {
        id
        type
        parentSectionId
        qnum
        pnum
        bnum
        order
        points
        description
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
  const rubric = convertRubric(res.rubrics);
  const {
    instructions,
    dbReferences: references,
    files,
  } = res;
  const answers = {
    answers: res.answers as AnswerState[][][],
    scratch: '',
  };
  const examContextVal = useMemo(() => ({
    files,
    fmap: createMap(files),
  }), [files]);
  const examViewerContextVal = useMemo(() => ({
    answers,
    rubric,
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
            {rubric?.examRubric && <ShowRubric rubric={rubric.examRubric} forWhat="exam" />}
            <div>
              <DisplayQuestions
                refreshCodeMirrorsDeps={refreshCodeMirrorsDeps}
                version={res}
                currentGrading={currentGrading}
                showRequestGrading={showRequestGrading}
                fullyExpandCode
                showStarterCode={showStarterCode}
              />
            </div>
          </div>
        </ExamFilesContext.Provider>
      </ExamViewerContext.Provider>
    </ExamContext.Provider>
  );
};

export default ExamViewer;
