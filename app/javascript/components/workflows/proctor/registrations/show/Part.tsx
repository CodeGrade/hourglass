import React, { useMemo, useContext } from 'react';
import { PartInfo } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import DisplayBody from '@proctor/registrations/show/DisplayBody';
import '@student/exams/show/components/Part.css';
import { PartFilesContext, ExamViewerContext } from '@hourglass/common/context';
import { PartName } from '@student/exams/show/components/Part';
import TooltipButton from '@student/exams/show/components/TooltipButton';
import ShowRubric from '@proctor/registrations/show/ShowRubric';
import { CurrentGrading } from '@hourglass/workflows/professor/exams/types';
import { pluralize } from '@hourglass/common/helpers';
import { graphql, useMutation } from 'relay-hooks';
import { AlertContext } from '@hourglass/common/alerts';
import { PartRequestGradingLockMutation } from './__generated__/PartRequestGradingLockMutation.graphql';

interface PartProps {
  refreshCodeMirrorsDeps: React.DependencyList;
  part: PartInfo;
  qnum: number;
  pnum: number;
  currentGrading?: CurrentGrading[number][number];
  anonymous?: boolean;
  showRequestGrading?: string;
  fullyExpandCode?: boolean;
}
const REQUEST_GRADE_MUTATION = graphql`
mutation PartRequestGradingLockMutation($input: RequestGradingLockInput!) {
  requestGradingLock(input: $input) {
    acquired
    currentOwner {
      id
      displayName
    }
  }
}
`;

export const ClaimGradingButton: React.FC<{
  registrationId: string;
  qnum: number;
  pnum: number;
  graded?: boolean;
  disabled?: boolean;
  disalbedMessage?: string;
}> = (props) => {
  const {
    registrationId,
    qnum,
    pnum,
    graded,
    disabled = false,
    disalbedMessage,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutateRequestGrade, {
    loading: requestLoading,
  }] = useMutation<PartRequestGradingLockMutation>(
    REQUEST_GRADE_MUTATION,
    {
      onCompleted: () => {
        alert({
          variant: 'success',
          title: 'Grading lock claimed',
          message: 'You now hold the grading lock for this part',
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error claiming grading lock',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  return (
    <TooltipButton
      variant="info"
      disabled={disabled || requestLoading}
      disabledMessage={disalbedMessage}
      cursorClass=""
      className=""
      onClick={() => {
        mutateRequestGrade({
          variables: {
            input: {
              registrationId,
              qnum,
              pnum,
            },
          },
        });
      }}
    >
      {`Claim this part for ${graded ? 'regrading' : 'grading'}`}
    </TooltipButton>
  );
};

const Part: React.FC<PartProps> = (props) => {
  const {
    refreshCodeMirrorsDeps,
    part,
    qnum,
    pnum,
    currentGrading,
    anonymous,
    showRequestGrading = false,
    fullyExpandCode = false,
  } = props;
  const {
    name,
    reference,
    description,
    points,
    extraCredit = false,
    body,
  } = part;
  const { rubric } = useContext(ExamViewerContext);
  const pRubric = rubric?.questions[qnum]?.parts[pnum]?.partRubric;
  const strPoints = pluralize(points, 'point', 'points');
  let subtitle;
  if (currentGrading?.score !== undefined) {
    subtitle = `${currentGrading?.score} / ${strPoints}${extraCredit ? ' (Extra credit)' : ''}`;
  } else {
    subtitle = `(${strPoints}${extraCredit ? ', extra credit' : ''})`;
  }
  const contextVal = useMemo(() => ({ references: reference }), [reference]);

  return (
    <PartFilesContext.Provider value={contextVal}>
      <div>
        <h3 id={`question-${qnum}-part-${pnum}`} className="d-flex align-items-baseline">
          <PartName anonymous={anonymous} name={name} pnum={pnum} />
          <span className="ml-auto">
            {anonymous || (
              <span className="point-count">
                {subtitle}
              </span>
            )}
            {showRequestGrading && (
              <span className="ml-4">
                <ClaimGradingButton
                  registrationId={showRequestGrading}
                  qnum={qnum}
                  pnum={pnum}
                  graded={currentGrading?.graded}
                  disabled={currentGrading?.inProgress}
                  disalbedMessage="This part is currently being graded"
                />
              </span>
            )}
          </span>
        </h3>
        {description?.value && <HTML value={description} />}
        {reference.length !== 0 && (
          <FileViewer
            references={reference}
            refreshProps={refreshCodeMirrorsDeps}
            fullyExpandCode={fullyExpandCode}
          />
        )}
        {pRubric && <ShowRubric rubric={pRubric} forWhat="part" />}
        {body.map((b, i) => (
          // Body numbers are STATIC.
          // eslint-disable-next-line react/no-array-index-key
          <div className={`p-2 bodyitem ${b.type}`} key={i}>
            <DisplayBody
              body={b}
              qnum={qnum}
              pnum={pnum}
              bnum={i}
              currentGrading={currentGrading?.body[i]}
              refreshCodeMirrorsDeps={refreshCodeMirrorsDeps}
              fullyExpandCode={fullyExpandCode}
            />
          </div>
        ))}
      </div>
    </PartFilesContext.Provider>
  );
};

export default Part;
