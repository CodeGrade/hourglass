import React, { useContext } from 'react';
import {
  Rubric,
  RubricOne,
  RubricAll,
  RubricAny,
  isRubricPresets,
  RubricPresets,
  Preset,
} from '@professor/exams/types';
import { ExhaustiveSwitchError, pluralize } from '@hourglass/common/helpers';
import HTML from '@student/exams/show/components/HTML';
import Icon from '@student/exams/show/components/Icon';
import {
  Alert,
  Button,
  Row,
  Col,
  ButtonGroup,
  Accordion,
} from 'react-bootstrap';
import { variantForPoints, iconForPoints } from '@grading/index';
import '@professor/exams/rubrics.scss';
import Tooltip from '@student/exams/show/components/Tooltip';
import { BsArrowUpRight, BsArrowDownRight } from 'react-icons/bs';
import { AlertContext } from '@hourglass/common/alerts';
import { CREATE_COMMENT_MUTATION, addCommentConfig } from '@grading/createComment';
import { useMutation } from 'relay-hooks';
import { createCommentMutation } from './__generated__/createCommentMutation.graphql';

export const foo = 1;
interface ShowRubricProps<R> {
  rubric: R;
  qnum: number;
  pnum: number;
  bnum: number;
  registrationId: string;
}

const ShowPreset: React.FC<{
  preset: Preset;
  registrationId: string;
  qnum: number;
  pnum: number;
  bnum: number;
}> = (props) => {
  const {
    preset,
    registrationId,
    qnum,
    pnum,
    bnum,
  } = props;
  const {
    points,
    graderHint,
    studentFeedback,
  } = preset;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<createCommentMutation>(
    CREATE_COMMENT_MUTATION,
    {
      configs: [addCommentConfig(registrationId)],
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error creating comment.',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const variant = variantForPoints(points);
  const VariantIcon = iconForPoints(points);
  return (
    <Alert variant={variant} className="p-0">
      <Tooltip
        showTooltip
        message="Click to apply this message"
      >
        <Button
          disabled={loading}
          variant={variant}
          size="sm"
          className="mr-2 align-self-center"
          onClick={(): void => {
            mutate({
              variables: {
                input: {
                  registrationId,
                  qnum,
                  pnum,
                  bnum,
                  message: (studentFeedback ?? graderHint).value,
                  points,
                },
              },
            });
          }}
        >
          <Icon I={VariantIcon} />
        </Button>
      </Tooltip>
      {`(${preset.points} points) `}
      <HTML className="d-inline-block" value={graderHint} />
    </Alert>
  );
};

const ShowRubricPresets: React.FC<ShowRubricProps<RubricPresets>> = (props) => {
  const {
    rubric,
    qnum,
    pnum,
    bnum,
    registrationId,
  } = props;
  const {
    direction,
    label,
    presets,
    mercy,
  } = rubric;
  const disabledMessage = (direction === 'credit'
    ? 'Credits counting up'
    : 'Deductions counting down'
  );
  return (
    <div>
      <Row>
        <Col>
          <ButtonGroup className="float-right">
            {label && <Button variant="outline-secondary" className="bg-white" size="sm" disabled>{label}</Button>}
            <Tooltip message={disabledMessage}>
              <Button
                variant="outline-secondary"
                className="bg-white"
                size="sm"
                disabled
              >
                <Icon I={direction === 'credit' ? BsArrowUpRight : BsArrowDownRight} />
              </Button>
            </Tooltip>
            {mercy && (
              <Button variant="outline-secondary" className="bg-white" size="sm" disabled>
                {`Up to ${pluralize(mercy, 'point', 'points')}`}
              </Button>
            )}
          </ButtonGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          {presets.map((p, index) => (
            <ShowPreset
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              preset={p}
              registrationId={registrationId}
              qnum={qnum}
              pnum={pnum}
              bnum={bnum}
            />
          ))}
        </Col>
      </Row>
    </div>
  );
};

const ShowAll: React.FC<ShowRubricProps<RubricAll>> = (props) => {
  const {
    rubric,
    qnum,
    pnum,
    bnum,
    registrationId,
  } = props;
  const { description, choices } = rubric;
  return (
    <>
      <h5>
        Choose something from
        <i className="mx-1">all</i>
        entries
      </h5>
      <div>
        <HTML value={description} />
        {isRubricPresets(choices) ? (
          <ShowRubricPresets
            rubric={choices}
            qnum={qnum}
            pnum={pnum}
            bnum={bnum}
            registrationId={registrationId}
          />
        ) : (
          <>
            {choices.map((c, index) => (
              <ShowRubric
                /* eslint-disable-next-line react/no-array-index-key */
                key={index}
                rubric={c}
                qnum={qnum}
                pnum={pnum}
                bnum={bnum}
                registrationId={registrationId}
              />
            ))}
          </>
        )}
      </div>
    </>
  );
};

const ShowOne: React.FC<ShowRubricProps<RubricOne>> = (props) => {
  const {
    rubric,
    qnum,
    pnum,
    bnum,
    registrationId,
  } = props;
  const { description, choices, points } = rubric;
  const pointsMsg = `(${pluralize(points, 'point', 'points')})`;
  if (isRubricPresets(choices)) {
    return (
      <>
        <h5>
          Choose something from
          <i className="mx-1">any</i>
          entries
          <span className="float-right">{pointsMsg}</span>
        </h5>
        <HTML value={description} />
        <ShowRubricPresets
          rubric={choices}
          qnum={qnum}
          pnum={pnum}
          bnum={bnum}
          registrationId={registrationId}
        />
      </>
    );
  }
  return (
    <>
      <h5>
        Choose something from
        <i className="mx-1">any</i>
        entries
        <span className="float-right">{pointsMsg}</span>
      </h5>
      <HTML value={description} />
      <Accordion>
        {choices.map((r, i) => (
          <ShowRubric
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            rubric={r}
            qnum={qnum}
            pnum={pnum}
            bnum={bnum}
            registrationId={registrationId}
          />
        ))}
      </Accordion>
    </>
  );
};

const ShowAny: React.FC<ShowRubricProps<RubricAny>> = (props) => {
  const { rubric } = props;
  return <>{JSON.stringify(rubric)}</>;
};

const ShowRubric: React.FC<ShowRubricProps<Rubric>> = (props) => {
  const {
    rubric,
    qnum,
    pnum,
    bnum,
    registrationId,
  } = props;
  let body;
  switch (rubric.type) {
    case 'none': return null;
    case 'all':
      body = (
        <ShowAll
          rubric={rubric}
          qnum={qnum}
          pnum={pnum}
          bnum={bnum}
          registrationId={registrationId}
        />
      );
      break;
    case 'any':
      body = (
        <ShowAny
          rubric={rubric}
          qnum={qnum}
          pnum={pnum}
          bnum={bnum}
          registrationId={registrationId}
        />
      );
      break;
    case 'one':
      body = (
        <ShowOne
          rubric={rubric}
          qnum={qnum}
          pnum={pnum}
          bnum={bnum}
          registrationId={registrationId}
        />
      );
      break;
    default:
      throw new ExhaustiveSwitchError(rubric, `showing rubric for q${qnum}-p${pnum}-b${bnum}`);
  }
  return (
    <Alert variant="dark">
      {body}
    </Alert>
  );
};

export const ShowRubrics: React.FC<{
  examRubric: Rubric;
  qnumRubric: Rubric;
  pnumRubric: Rubric;
  bnumRubric: Rubric;
  qnum: number;
  pnum: number;
  bnum: number;
  registrationId: string;
}> = (props) => {
  const {
    examRubric,
    qnumRubric,
    pnumRubric,
    bnumRubric,
    qnum,
    pnum,
    bnum,
    registrationId,
  } = props;
  return (
    <>
      {examRubric && (
        <>
          <h5>Exam-wide rubric</h5>
          <div className="rubric">
            <ShowRubric
              rubric={examRubric}
              qnum={qnum}
              pnum={pnum}
              bnum={bnum}
              registrationId={registrationId}
            />
          </div>
        </>
      )}
      {qnumRubric && (
        <>
          <h5>Question rubric</h5>
          <div className="rubric">
            <ShowRubric
              rubric={qnumRubric}
              qnum={qnum}
              pnum={pnum}
              bnum={bnum}
              registrationId={registrationId}
            />
          </div>
        </>
      )}
      {pnumRubric && (
        <>
          <h5>Part rubric</h5>
          <div className="rubric">
            <ShowRubric
              rubric={pnumRubric}
              qnum={qnum}
              pnum={pnum}
              bnum={bnum}
              registrationId={registrationId}
            />
          </div>
        </>
      )}
      {bnumRubric && (
        <>
          <h5>Item rubric</h5>
          <div className="rubric">
            <ShowRubric
              rubric={bnumRubric}
              qnum={qnum}
              pnum={pnum}
              bnum={bnum}
              registrationId={registrationId}
            />
          </div>
        </>
      )}
    </>
  );
};
