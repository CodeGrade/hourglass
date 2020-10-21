import React, { useMemo, useContext } from 'react';
import { QuestionInfo } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import Part, { ClaimGradingButton } from '@proctor/registrations/show/Part';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import { QuestionFilesContext, ExamViewerContext } from '@hourglass/common/context';
import { QuestionName } from '@student/exams/show/components/ShowQuestion';
import ShowRubric from '@proctor/registrations/show/ShowRubric';
import { CurrentGrading } from '@professor/exams/types';
import { pluralize } from '@hourglass/common/helpers';

interface ShowQuestionProps {
  refreshCodeMirrorsDeps: React.DependencyList;
  question: QuestionInfo;
  qnum: number;
  currentGrading?: CurrentGrading[number];
  showRequestGrading?: string;
}

const ShowQuestion: React.FC<ShowQuestionProps> = (props) => {
  const {
    refreshCodeMirrorsDeps,
    question,
    qnum,
    currentGrading = [],
    showRequestGrading,
  } = props;
  const {
    name,
    reference,
    description,
    parts,
  } = question;
  const { rubric } = useContext(ExamViewerContext);
  const qRubric = rubric?.questions[qnum]?.questionRubric;
  const singlePart = parts.length === 1 && !parts[0].name?.value?.trim();
  const points = parts.reduce((pts, p, _idx) => pts + p.points, 0);
  const strPoints = pluralize(points, 'point', 'points');
  let curScore = 0;
  for (let i = 0; i < parts.length; i += 1) {
    if (currentGrading[i]?.score !== undefined) {
      curScore += currentGrading[i].score;
    } else {
      curScore = undefined;
    }
  }
  let subtitle;
  if (curScore !== undefined) {
    subtitle = `${curScore} / ${strPoints}`;
  } else {
    subtitle = `(${strPoints})`;
  }
  const contextVal = useMemo(() => ({ references: reference }), [reference]);
  return (
    <QuestionFilesContext.Provider value={contextVal}>
      <div>
        <h1 id={`question-${qnum}`} className="d-flex align-items-baseline">
          <QuestionName name={name} qnum={qnum} />
          {singlePart && (
            <span className="ml-auto">
              <span className="point-count">
                {subtitle}
              </span>
              {showRequestGrading && (
                <span className="ml-4">
                  <ClaimGradingButton
                    registrationId={showRequestGrading}
                    qnum={qnum}
                    pnum={0}
                    graded={currentGrading[0]?.graded}
                    disabled={currentGrading[0]?.inProgress}
                    disalbedMessage="This question is currently being graded"
                  />
                </span>
              )}
            </span>
          )}
        </h1>
        <HTML value={description} />
        {reference.length !== 0 && (
          <FileViewer
            references={reference}
            refreshProps={refreshCodeMirrorsDeps}
          />
        )}
        {qRubric && <ShowRubric rubric={qRubric} forWhat="question" />}
        {parts.map((p, i) => (
          <Part
            // Part numbers are STATIC.
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            anonymous={singlePart}
            part={p}
            pnum={i}
            qnum={qnum}
            currentGrading={currentGrading[i]}
            refreshCodeMirrorsDeps={refreshCodeMirrorsDeps}
            showRequestGrading={singlePart ? null : showRequestGrading}
          />
        ))}
      </div>
    </QuestionFilesContext.Provider>
  );
};
export default ShowQuestion;
