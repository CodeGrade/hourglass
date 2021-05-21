import React, { useMemo } from 'react';
import HTML from '@student/exams/show/components/HTML';
import Part, { ClaimGradingButton } from '@proctor/registrations/show/Part';
import { graphql, useFragment } from 'relay-hooks';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import { QuestionFilesContext } from '@hourglass/common/context';
import { QuestionName } from '@student/exams/show/components/ShowQuestion';
import { ShowRubricKey } from '@proctor/registrations/show/ShowRubric';
import { CurrentGrading } from '@professor/exams/types';
import { pluralize } from '@hourglass/common/helpers';
import { ShowQuestion$key } from './__generated__/ShowQuestion.graphql';

interface ShowQuestionProps {
  refreshCodeMirrorsDeps: React.DependencyList;
  questionKey: ShowQuestion$key,
  qnum: number;
  currentGrading?: CurrentGrading[number];
  registrationId?: string;
  fullyExpandCode: boolean;
  overviewMode: boolean;
}

const ShowQuestion: React.FC<ShowQuestionProps> = (props) => {
  const {
    refreshCodeMirrorsDeps,
    questionKey,
    qnum,
    currentGrading = [],
    registrationId,
    fullyExpandCode,
    overviewMode,
  } = props;
  const res = useFragment<ShowQuestion$key>(
    graphql`
    fragment ShowQuestion on Question {
      id
      rootRubric @include(if: $withRubric) { ...ShowRubricKey } 
      name {
        type
        value
      }
      description {
        type
        value
      }
      separateSubparts
      references {
        type
        path
      }
      parts { 
        id
        name { value }
        points
        ...PartShow 
      }
    }`,
    questionKey,
  );
  const {
    name,
    references,
    description,
    parts,
    rootRubric,
  } = res;
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
  const contextVal = useMemo(() => ({ references }), [references]);
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
              {registrationId && (
                <span className="ml-4">
                  <ClaimGradingButton
                    registrationId={registrationId}
                    qnum={qnum}
                    pnum={0}
                    graded={currentGrading[0]?.graded}
                    disabled={currentGrading[0]?.inProgress}
                    disabledMessage="This question is currently being graded"
                  />
                </span>
              )}
            </span>
          )}
        </h1>
        <HTML value={description} />
        {references.length !== 0 && (
          <FileViewer
            references={references}
            refreshProps={refreshCodeMirrorsDeps}
            fullyExpandCode={fullyExpandCode}
          />
        )}
        {rootRubric && overviewMode && <ShowRubricKey rubricKey={rootRubric} forWhat="question" />}
        {parts.map((p, i) => (
          <Part
            key={p.id}
            anonymous={singlePart}
            partKey={p}
            pnum={i}
            qnum={qnum}
            currentGrading={currentGrading[i]}
            refreshCodeMirrorsDeps={refreshCodeMirrorsDeps}
            showRequestGrading={singlePart ? null : registrationId}
            fullyExpandCode={fullyExpandCode}
            overviewMode={overviewMode}
          />
        ))}
      </div>
    </QuestionFilesContext.Provider>
  );
};
export default ShowQuestion;
