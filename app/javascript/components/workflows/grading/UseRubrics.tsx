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
    <Alert variant={variant} className="p-0 preset">
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
                  message: (studentFeedback ?? graderHint),
                  points,
                },
              },
            });
          }}
        >
          <Icon I={VariantIcon} className="mr-2" />
          {`${preset.points} points`}
        </Button>
      </Tooltip>
      <span>{graderHint}</span>
    </Alert>
  );
};

const ShowPresetSummary: React.FC<{
  direction: RubricPresets['direction'];
  label: string;
  mercy: number;
  pointsMsg?: string;
}> = (props) => {
  const {
    direction,
    label,
    mercy,
    pointsMsg,
  } = props;
  const disabledMessage = (direction === 'credit'
    ? 'Credits counting up'
    : 'Deductions counting down'
  );
  return (
    <ButtonGroup>
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
      {pointsMsg !== undefined && (
        <Button variant="outline-secondary" className="bg-white" size="sm" disabled>
          {pointsMsg}
        </Button>
      )}
    </ButtonGroup>
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
    presets,
  } = rubric;
  return (
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
  let summary;
  let body;
  if (isRubricPresets(choices)) {
    const { direction, label, mercy } = choices;
    summary = (
      <span className="ml-auto">
        <ShowPresetSummary
          direction={direction}
          label={label}
          mercy={mercy}
        />
      </span>
    );
    body = (
      <ShowRubricPresets
        rubric={choices}
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        registrationId={registrationId}
      />
    );
  } else {
    body = (
      <div className="rubric">
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
      </div>
    );
  }
  const heading = (
    <h5 className="d-flex align-items-center">
      Choose something from
      <i className="mx-1">all</i>
      entries
      <span className="ml-auto">{summary}</span>
    </h5>
  );
  return (
    <>
      {heading}
      <HTML value={description} />
      {body}
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
  let summary;
  let body;
  if (isRubricPresets(choices)) {
    const { direction, label, mercy } = choices;
    summary = (
      <ShowPresetSummary
        direction={direction}
        label={label}
        mercy={mercy}
        pointsMsg={pointsMsg}
      />
    );
    body = (
      <ShowRubricPresets
        rubric={choices}
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        registrationId={registrationId}
      />
    );
  } else {
    summary = <>{pointsMsg}</>;
    body = (
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
    );
  }
  const heading = (
    <h5 className="d-flex align-items-center">
      Choose exactly
      <i className="mx-1">one</i>
      entry
      <span className="ml-auto">{summary}</span>
    </h5>
  );
  return (
    <div>
      {heading}
      <HTML value={description} />
      {body}
    </div>
  );
};

const ShowAny: React.FC<ShowRubricProps<RubricAny>> = (props) => {
  const {
    rubric,
    qnum,
    pnum,
    bnum,
    registrationId,
  } = props;
  const { description, choices, points } = rubric;
  let summary;
  let body;
  if (isRubricPresets(choices)) {
    const { direction, label, mercy } = choices;
    const pointsMsg = `(${pluralize(points, 'point', 'points')})`;
    summary = (
      <span className="ml-auto">
        <ShowPresetSummary
          direction={direction}
          label={label}
          mercy={mercy}
          pointsMsg={pointsMsg}
        />
      </span>
    );
    body = (
      <ShowRubricPresets
        rubric={choices}
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        registrationId={registrationId}
      />
    );
  } else {
    body = (
      <div className="rubric">
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
      </div>
    );
  }
  const heading = (
    <h5 className="d-flex align-items-center">
      Choose something from
      <i className="mx-1">any</i>
      appropriate entries
      <span className="ml-auto">{summary}</span>
    </h5>
  );
  return (
    <div>
      {heading}
      <HTML value={description} />
      {body}
    </div>
  );
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

function nonEmptyRubric(r ?: Rubric): boolean {
  return r !== null && r !== undefined && r.type !== 'none';
}

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
      {nonEmptyRubric(examRubric) && (
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
      {nonEmptyRubric(qnumRubric) && (
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
      {nonEmptyRubric(pnumRubric) && (
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
      {nonEmptyRubric(bnumRubric) && (
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
