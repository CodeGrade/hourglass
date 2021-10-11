import React, { useMemo, useContext } from 'react';
import { BodyItem } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import DisplayBody from '@proctor/registrations/show/DisplayBody';
import '@student/exams/show/components/Part.css';
import { PartFilesContext } from '@hourglass/common/context';
import { PartName } from '@student/exams/show/components/Part';
import TooltipButton from '@student/exams/show/components/TooltipButton';
import { ShowRubricKey } from '@proctor/registrations/show/ShowRubric';
import { CurrentGrading } from '@professor/exams/types';
import { pluralize } from '@hourglass/common/helpers';
import { graphql, useFragment, useMutation } from 'relay-hooks';
import { AlertContext } from '@hourglass/common/alerts';
import { PartRequestGradingLockMutation } from './__generated__/PartRequestGradingLockMutation.graphql';

import { PartShow$key } from './__generated__/PartShow.graphql';

interface PartProps {
  refreshCodeMirrorsDeps: React.DependencyList;
  partKey: PartShow$key;
  qnum: number;
  pnum: number;
  currentGrading?: CurrentGrading[number][number];
  anonymous?: boolean;
  showRequestGrading?: string;
  fullyExpandCode?: boolean;
  overviewMode: boolean;
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
  disabledMessage?: string;
}> = (props) => {
  const {
    registrationId,
    qnum,
    pnum,
    graded,
    disabled = false,
    disabledMessage,
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
      disabledMessage={disabledMessage}
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
    partKey,
    qnum,
    pnum,
    currentGrading,
    anonymous,
    showRequestGrading = false,
    fullyExpandCode = false,
    overviewMode,
  } = props;
  const res = useFragment<PartShow$key>(
    graphql`
    fragment PartShow on Part {
      id
      name {
        type
        value
      }
      description {
        type
        value
      }
      points
      extraCredit
      rootRubric @include(if: $withRubric) { ...ShowRubricKey } 
      references {
        type
        path
      }
      bodyItems {
        id
        info
        ...DisplayBody
      }
    }
    `,
    partKey,
  );
  const {
    name,
    references,
    description,
    points,
    extraCredit,
    bodyItems,
    rootRubric,
  } = res;
  const strPoints = pluralize(points, 'point', 'points');
  let subtitle;
  if (currentGrading?.score !== undefined) {
    subtitle = `${currentGrading?.score} / ${strPoints}${extraCredit ? ' (Extra credit)' : ''}`;
  } else {
    subtitle = `(${strPoints}${extraCredit ? ', extra credit' : ''})`;
  }
  const contextVal = useMemo(() => ({ references }), [references]);

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
                  disabledMessage="This part is currently being graded"
                />
              </span>
            )}
          </span>
        </h3>
        {description?.value && <HTML value={description} />}
        {references.length !== 0 && (
          <FileViewer
            references={references}
            refreshProps={refreshCodeMirrorsDeps}
            fullyExpandCode={fullyExpandCode}
          />
        )}
        {rootRubric && overviewMode && <ShowRubricKey rubricKey={rootRubric} forWhat="part" />}
        {bodyItems.map((b, i) => (
          <div className={`p-2 bodyitem ${(b as BodyItem).info.type}`} key={b.id}>
            <DisplayBody
              bodyKey={b}
              qnum={qnum}
              pnum={pnum}
              bnum={i}
              currentGrading={currentGrading?.body[i]}
              refreshCodeMirrorsDeps={refreshCodeMirrorsDeps}
              fullyExpandCode={fullyExpandCode}
              overviewMode={overviewMode}
            />
          </div>
        ))}
      </div>
    </PartFilesContext.Provider>
  );
};

export default Part;
