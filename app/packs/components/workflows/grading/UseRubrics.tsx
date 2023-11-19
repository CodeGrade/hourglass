import React, { useContext, useEffect } from 'react';
import {
  Rubric,
  RubricOne,
  RubricAll,
  RubricAny,
  RubricPresets,
  Preset,
} from '@professor/exams/types';
import { ExhaustiveSwitchError, pluralize, useMutationWithDefaults } from '@hourglass/common/helpers';
import HTML from '@student/exams/show/components/HTML';
import Icon from '@student/exams/show/components/Icon';
import {
  Alert,
  Card,
  Button,
  Row,
  Col,
  ButtonGroup,
  Accordion,
  AccordionContext,
} from 'react-bootstrap';
import { variantForPoints, iconForPoints } from '@grading/index';
import '@professor/exams/rubrics.scss';
import Tooltip from '@student/exams/show/components/Tooltip';
import { BsArrowUpRight, BsArrowDownRight } from 'react-icons/bs';
import { AlertContext } from '@hourglass/common/alerts';
import { CREATE_COMMENT_MUTATION, addCommentConfig } from '@grading/createComment';
import { graphql, useFragment } from 'react-relay';
import { expandRootRubric } from '@professor/exams/rubrics';
import {
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaCheck,
} from 'react-icons/fa';

import { createCommentMutation } from './__generated__/createCommentMutation.graphql';
import { grading_one$data } from './__generated__/grading_one.graphql';
import { UseRubricsKey$key } from './__generated__/UseRubricsKey.graphql';

type GradingComment = grading_one$data['gradingComments']['edges'][number]['node'];
type PresetCommentId = GradingComment['presetComment']['id']

interface ShowRubricProps<R> {
  rubric: R;
  showCompletenessAgainst?: PresetCommentId[];
  onRubricCompletionChanged?: (newCompletion: CompletionStatus) => void;
  parentRubricType?: Rubric['type'];
  collapseKey?: string;
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
    id,
    points,
    graderHint,
    studentFeedback,
  } = preset;
  const { alert } = useContext(AlertContext);
  const [mutate, loading] = useMutationWithDefaults<createCommentMutation>(
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
                  presetCommentId: id,
                  qnum,
                  pnum,
                  bnum,
                  message: (studentFeedback || graderHint),
                  points,
                },
              },
            });
          }}
        >
          <Icon I={VariantIcon} className="mr-2" />
          {pluralize(preset.points, 'point', 'points')}
        </Button>
      </Tooltip>
      <span>{graderHint}</span>
    </Alert>
  );
};

export type CompletionStatus = 'unused' | 'complete' | 'incomplete' | 'invalid'
/** Enforces the ordering `unused < complete < invalid` and `unused < incomplete < invalid` < */
function any<T>(vals: T[], target: T): boolean {
  return vals.some((v) => v === target);
}
function one<T>(vals: T[], target: T): boolean {
  return vals.filter((v) => v === target).length === 1;
}
function several<T>(vals: T[], target: T): boolean {
  return vals.filter((v) => v === target).length > 1;
}
function all<T>(vals: T[], target: T): boolean {
  return vals.every((v) => v === target);
}
function none<T>(vals: T[], target: T): boolean {
  return !vals.some((v) => v === target);
}

function combineCompletionOne(cs: CompletionStatus[]): CompletionStatus {
  if (all(cs, 'unused')) return 'unused';
  if (any(cs, 'invalid')) return 'invalid';
  if (one(cs, 'complete') && none(cs, 'incomplete')) return 'complete';
  if (several(cs, 'complete') || several(cs, 'incomplete')) return 'invalid';
  return 'incomplete';
}
export function combineCompletionAny(cs: CompletionStatus[]): CompletionStatus {
  if (all(cs, 'unused')) return 'unused';
  if (any(cs, 'invalid')) return 'invalid';
  if (any(cs, 'complete') && none(cs, 'incomplete')) return 'complete';
  return 'incomplete';
}
function combineCompletionAll(cs: CompletionStatus[]): CompletionStatus {
  if (all(cs, 'complete')) return 'complete';
  if (any(cs, 'invalid')) return 'invalid';
  if (all(cs, 'unused')) return 'unused';
  return 'incomplete';
}
function completionStatus(rubric: Rubric, parentRubricType: Rubric['type'], presetIDs: PresetCommentId[]): CompletionStatus {
  if (rubric === undefined || rubric === null) return undefined;
  if (presetIDs === undefined || presetIDs === null) return undefined;
  switch (rubric.type) {
    case 'none': return 'complete';
    case 'all': {
      const { choices } = rubric;
      if (choices instanceof Array) {
        return combineCompletionAll(
          choices.map((r) => completionStatus(r, 'all', presetIDs)),
        );
      }
      return combineCompletionAll(
        choices.presets.map((p) => (presetIDs.some((id) => p.id === id) ? 'complete' : 'unused')),
      );
    }
    case 'any': {
      const { choices } = rubric;
      if (choices instanceof Array) {
        return combineCompletionAny(
          choices.map((r) => completionStatus(r, 'any', presetIDs)),
        );
      }
      return combineCompletionAny(
        choices.presets.map((p) => (presetIDs.some((id) => p.id === id) ? 'complete' : 'unused')),
      );
    }
    case 'one': {
      const { choices } = rubric;
      if (choices instanceof Array) {
        return combineCompletionOne(
          choices.map((r) => completionStatus(r, 'one', presetIDs)),
        );
      }
      return combineCompletionOne(
        choices.presets.map((p) => (presetIDs.some((id) => p.id === id) ? 'complete' : 'unused')),
      );
    }
    default:
      throw new ExhaustiveSwitchError(rubric);
  }
}
const statusToClass = (status: CompletionStatus): string => {
  if (status === 'complete') {
    return 'status-valid';
  }
  if (status === 'invalid' || status === 'incomplete') {
    return 'status-invalid';
  }
  return '';
};

export const ShowPresetSummary: React.FC<{
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
        <Button variant="outline-secondary" className="bg-white text-nowrap" size="sm" disabled>
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
        {presets.map((p) => (
          <ShowPreset
            key={p.id}
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

const statusIcons = (
  <>
    <Button
      variant="outline-success"
      className="floatLeft mt-n3 ml-n3 mr-2 status-valid"
      disabled
      title="Rubric is complete"
    >
      <Icon I={FaCheck} />
    </Button>
    <Button
      variant="outline-danger"
      className="floatLeft mt-n3 ml-n3 mr-2 status-invalid"
      disabled
      title="Rubric is incomplete"
    >
      <Icon I={FaTimes} />
    </Button>
  </>
);

const ShowAll: React.FC<ShowRubricProps<RubricAll>> = (props) => {
  const {
    rubric,
    showCompletenessAgainst,
    qnum,
    pnum,
    bnum,
    registrationId,
    collapseKey,
  } = props;
  const { description, choices } = rubric;
  const showChevron = !!collapseKey;
  const currentEventKey = useContext(AccordionContext);
  const isOpen = collapseKey === currentEventKey;
  let summary;
  let body;
  if (choices instanceof Array) {
    body = (
      <>
        {choices.map((c) => (
          <ShowRubric
            key={c.id}
            showCompletenessAgainst={showCompletenessAgainst}
            parentRubricType="all"
            rubric={c}
            qnum={qnum}
            pnum={pnum}
            bnum={bnum}
            registrationId={registrationId}
          />
        ))}
      </>
    );
  } else {
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
  }
  const showAnyway = (collapseKey === undefined ? 'show' : '');
  const padDescription = (description ? 'mb-2' : '');
  let chevron = null;
  if (showChevron) {
    if (isOpen) {
      chevron = <Icon className="mr-2" I={FaChevronUp} />;
    } else {
      chevron = <Icon className="mr-2" I={FaChevronDown} />;
    }
  }
  const heading = (
    <h5 className="d-flex align-items-center">
      {statusIcons}
      <span>
        {chevron}
        Choose something from
        <i className="mx-1">all</i>
        entries
      </span>
      <span className="ml-auto">{summary}</span>
    </h5>
  );
  return (
    <>
      <Accordion.Toggle as={Card.Header} eventKey={collapseKey}>
        {heading}
        <HTML value={description} className={padDescription} />
      </Accordion.Toggle>
      <Accordion.Collapse className={showAnyway} eventKey={collapseKey}>
        <Card.Body>
          {body}
        </Card.Body>
      </Accordion.Collapse>
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
    showCompletenessAgainst,
    collapseKey,
  } = props;
  const { description, choices, points } = rubric;
  const pointsMsg = `(${pluralize(points, 'point', 'points')})`;
  const currentEventKey = useContext(AccordionContext);
  const showChevron = !!collapseKey;
  const isOpen = collapseKey === currentEventKey;
  let summary: React.ReactNode;
  let body;
  if (choices instanceof Array) {
    summary = pointsMsg;
    body = (
      <Accordion>
        {choices.map((r) => (
          <ShowRubric
            key={r.id}
            rubric={r}
            qnum={qnum}
            pnum={pnum}
            bnum={bnum}
            registrationId={registrationId}
            showCompletenessAgainst={showCompletenessAgainst}
            parentRubricType="one"
            collapseKey={r.id}
          />
        ))}
      </Accordion>
    );
  } else {
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
  }
  const showAnyway = (showChevron ? '' : 'show');
  const padDescription = (description ? 'mb-2' : '');
  let chevron = null;
  if (showChevron) {
    if (isOpen) {
      chevron = <Icon className="mr-2" I={FaChevronUp} />;
    } else {
      chevron = <Icon className="mr-2" I={FaChevronDown} />;
    }
  }
  const heading = (
    <h5 className="d-flex align-items-center">
      {statusIcons}
      <span>
        {chevron}
        Choose exactly
        <i className="mx-1">one</i>
        entry
      </span>
      <span className="ml-auto">{summary}</span>
    </h5>
  );
  return (
    <>
      <Accordion.Toggle as={Card.Header} eventKey={collapseKey}>
        {heading}
        <HTML value={description} className={padDescription} />
      </Accordion.Toggle>
      <Accordion.Collapse className={showAnyway} eventKey={collapseKey}>
        <Card.Body>
          {body}
        </Card.Body>
      </Accordion.Collapse>
    </>
  );
};

const ShowAny: React.FC<ShowRubricProps<RubricAny>> = (props) => {
  const {
    rubric,
    qnum,
    pnum,
    bnum,
    registrationId,
    showCompletenessAgainst,
    collapseKey,
  } = props;
  const { description, choices, points } = rubric;
  const currentEventKey = useContext(AccordionContext);
  const showChevron = !!collapseKey;
  const isOpen = collapseKey === currentEventKey;
  let summary;
  let body;
  if (choices instanceof Array) {
    body = (
      <>
        {choices.map((c) => (
          <ShowRubric
            key={c.id}
            rubric={c}
            qnum={qnum}
            pnum={pnum}
            bnum={bnum}
            registrationId={registrationId}
            parentRubricType="any"
            showCompletenessAgainst={showCompletenessAgainst}
          />
        ))}
      </>
    );
  } else {
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
  }
  const showAnyway = (showChevron ? '' : 'show');
  const padDescription = (description ? 'mb-2' : '');
  let chevron = null;
  if (showChevron) {
    if (isOpen) {
      chevron = <Icon className="mr-2" I={FaChevronUp} />;
    } else {
      chevron = <Icon className="mr-2" I={FaChevronDown} />;
    }
  }
  const heading = (
    <h5 className="d-flex align-items-center">
      {statusIcons}
      <span>
        {chevron}
        Choose something from
        <i className="mx-1">any</i>
        appropriate entries
      </span>
      <span className="ml-auto">{summary}</span>
    </h5>
  );
  return (
    <>
      <Accordion.Toggle as={Card.Header} eventKey={collapseKey}>
        {heading}
        <HTML value={description} className={padDescription} />
      </Accordion.Toggle>
      <Accordion.Collapse className={showAnyway} eventKey={collapseKey}>
        <Card.Body>
          {body}
        </Card.Body>
      </Accordion.Collapse>
    </>
  );
};

export function nonEmptyRubric(r ?: Rubric): boolean {
  return r !== null && r !== undefined && r.type !== 'none';
}

const ShowRubricKey: React.FC<ShowRubricProps<UseRubricsKey$key> & {
  caption: string,
}> = (props) => {
  const {
    caption,
    rubric: rubricKey,
    showCompletenessAgainst,
    onRubricCompletionChanged,
    qnum,
    pnum,
    bnum,
    registrationId,
  } = props;
  const rawRubric = useFragment<UseRubricsKey$key>(
    graphql`
    fragment UseRubricsKey on Rubric {
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
      subsections { id }
      allSubsections {
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
        subsections { id }
      }
    }
    `,
    rubricKey,
  );
  const rubric = expandRootRubric(rawRubric);
  if (nonEmptyRubric(rubric)) {
    return (
      <>
        <h5>{caption}</h5>
        <div className="rubric">
          <ShowRubric
            rubric={rubric}
            showCompletenessAgainst={showCompletenessAgainst}
            onRubricCompletionChanged={onRubricCompletionChanged}
            qnum={qnum}
            pnum={pnum}
            bnum={bnum}
            registrationId={registrationId}
          />
        </div>
      </>
    );
  }
  return null;
};

const ShowRubric: React.FC<ShowRubricProps<Rubric>> = (props) => {
  const {
    rubric,
    qnum,
    pnum,
    bnum,
    registrationId,
    parentRubricType,
    showCompletenessAgainst,
    onRubricCompletionChanged,
    collapseKey,
  } = props;
  const rawShowCompleteness = completionStatus(rubric, parentRubricType, showCompletenessAgainst);
  let showCompleteness;
  if (parentRubricType === undefined) {
    showCompleteness = (rawShowCompleteness === 'unused') ? 'incomplete' : rawShowCompleteness;
  } else {
    showCompleteness = rawShowCompleteness;
  }
  useEffect(() => {
    if (onRubricCompletionChanged) onRubricCompletionChanged(showCompleteness);
  }, [showCompleteness]);
  const completenessClass = statusToClass(showCompleteness);
  let body;
  switch (rubric.type) {
    case 'none': return null;
    case 'all':
      body = (
        <ShowAll
          rubric={rubric}
          showCompletenessAgainst={showCompletenessAgainst}
          parentRubricType={parentRubricType}
          collapseKey={collapseKey}
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
          showCompletenessAgainst={showCompletenessAgainst}
          parentRubricType={parentRubricType}
          collapseKey={collapseKey}
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
          showCompletenessAgainst={showCompletenessAgainst}
          parentRubricType={parentRubricType}
          collapseKey={collapseKey}
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
    <Card className={`${completenessClass} alert-dark`}>
      {body}
    </Card>
  );
};

export const ShowRubrics: React.FC<{
  examRubricKey: UseRubricsKey$key;
  qnumRubricKey: UseRubricsKey$key;
  pnumRubricKey: UseRubricsKey$key;
  bnumRubricKey: UseRubricsKey$key;
  showCompletenessAgainst?: PresetCommentId[];
  onRubricCompletionChanged: (type: string, newCompletion: CompletionStatus) => void;
  qnum: number;
  pnum: number;
  bnum: number;
  registrationId: string;
}> = (props) => {
  const {
    examRubricKey,
    qnumRubricKey,
    pnumRubricKey,
    bnumRubricKey,
    showCompletenessAgainst,
    onRubricCompletionChanged,
    qnum,
    pnum,
    bnum,
    registrationId,
  } = props;
  return (
    <>
      <ShowRubricKey
        caption="Exam-wide rubric"
        rubric={examRubricKey}
        showCompletenessAgainst={showCompletenessAgainst}
        onRubricCompletionChanged={(b) => onRubricCompletionChanged('exam', b)}
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        registrationId={registrationId}
      />
      <ShowRubricKey
        caption="Question rubric"
        rubric={qnumRubricKey}
        showCompletenessAgainst={showCompletenessAgainst}
        onRubricCompletionChanged={(b) => onRubricCompletionChanged('question', b)}
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        registrationId={registrationId}
      />
      <ShowRubricKey
        caption="Part rubric"
        rubric={pnumRubricKey}
        showCompletenessAgainst={showCompletenessAgainst}
        onRubricCompletionChanged={(b) => onRubricCompletionChanged('part', b)}
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        registrationId={registrationId}
      />
      <ShowRubricKey
        caption="Item rubric"
        rubric={bnumRubricKey}
        showCompletenessAgainst={showCompletenessAgainst}
        onRubricCompletionChanged={(b) => onRubricCompletionChanged('item', b)}
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        registrationId={registrationId}
      />
    </>
  );
};
