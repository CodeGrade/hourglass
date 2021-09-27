import React, { useContext } from 'react';
import {
  Rubric,
  RubricOne,
  RubricAll,
  RubricAny,
  RubricPresets,
  Preset,
} from '@professor/exams/types';
import { ExhaustiveSwitchError, pluralize } from '@hourglass/common/helpers';
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
import { graphql, useFragment, useMutation } from 'relay-hooks';
import { expandRootRubric } from '@professor/exams/rubrics';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

import { createCommentMutation } from './__generated__/createCommentMutation.graphql';
import { grading_one$data } from './__generated__/grading_one.graphql';
import { UseRubricsKey$key } from './__generated__/UseRubricsKey.graphql';

type GradingComment = grading_one$data['gradingComments']['edges'][number]['node'];
type PresetCommentId = GradingComment['presetComment']['id']

interface ShowRubricProps<R> {
  rubric: R;
  showCompletenessAgainst?: PresetCommentId[];
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

type CompletionStatus = 'complete' | 'incomplete' | 'invalid'
function combineCompletionAll(c1 : CompletionStatus, c2: CompletionStatus): CompletionStatus {
  // complete < incomplete < invalid
  switch (c1) {
    case 'complete': return c2;
    case 'incomplete': return (c2 === 'invalid') ? c2 : c1;
    case 'invalid': return c1;
    default:
      throw new ExhaustiveSwitchError(c1);
  }
}
function combineCompletionAny(c1 : CompletionStatus, c2: CompletionStatus): CompletionStatus {
  // incomplete < complete < invalid
  switch (c1) {
    case 'incomplete': return c2;
    case 'complete': return (c2 !== 'incomplete') ? c2 : c1;
    case 'invalid': return c1;
    default:
      throw new ExhaustiveSwitchError(c1);
  }
}
function completionStatus(rubric: Rubric, parentRubricType: Rubric['type'], presetIDs: PresetCommentId[]): CompletionStatus {
  if (rubric === undefined || rubric === null) return undefined;
  if (presetIDs === undefined || presetIDs === null) return undefined;
  switch (rubric.type) {
    case 'none': return 'complete';
    case 'all': {
      const { choices } = rubric;
      if (choices instanceof Array) {
        const completion = choices.reduce((cur: CompletionStatus, r) => (
          combineCompletionAll(cur, completionStatus(r, 'all', presetIDs))
        ), 'complete');
        return (completion === 'incomplete') ? 'invalid' : completion;
      }
      const allUsed = choices.presets.every((p) => presetIDs.some((id) => (p.id === id)));
      return allUsed ? 'complete' : 'invalid';
    }
    case 'any': {
      const { choices } = rubric;
      if (choices instanceof Array) {
        const completion = choices.reduce((cur: CompletionStatus, r) => (
          combineCompletionAny(cur, completionStatus(r, 'any', presetIDs))
        ), 'incomplete');
        // An Any rubric is not in error if it's unused
        return completion;
      }
      const anyUsed = choices.presets.some((p) => presetIDs.some((id) => (p.id === id)));
      return anyUsed ? 'complete' : 'incomplete';
    }
    case 'one': {
      // There should be exactly one used message
      const { choices } = rubric;
      if (choices instanceof Array) {
        const completion = choices.map((r) => completionStatus(r, 'one', presetIDs));
        const completeCount = completion.filter((c) => c === 'complete').length;
        if (completeCount > 1 || completion.includes('invalid')) return 'invalid';
        if (completeCount === 1) return 'complete';
        if (parentRubricType === 'one') return 'incomplete';
        return 'invalid';
      }
      const matches = choices.presets.reduce((sum, p) => (
        sum + presetIDs.filter((id) => (p.id === id)).length
      ), 0);
      if (matches > 1) return 'invalid';
      if (matches === 1) return 'complete';
      if (parentRubricType === 'one') return 'incomplete';
      return 'invalid';
    }
    default:
      throw new ExhaustiveSwitchError(rubric);
  }
}
const statusToClass = (status: CompletionStatus): string => {
  if (status === 'complete') {
    return 'status-valid';
  }
  if (status === 'invalid') {
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
  const heading = (
    <h5 className="d-flex align-items-center">
      <span>
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
  let summary;
  let body;
  if (choices instanceof Array) {
    summary = <>{pointsMsg}</>;
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

function nonEmptyRubric(r ?: Rubric): boolean {
  return r !== null && r !== undefined && r.type !== 'none';
}

const ShowRubricKey: React.FC<ShowRubricProps<UseRubricsKey$key> & {
  caption: string,
}> = (props) => {
  const {
    caption,
    rubric: rubricKey,
    showCompletenessAgainst,
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
    collapseKey,
  } = props;
  const showCompleteness = completionStatus(rubric, parentRubricType, showCompletenessAgainst);
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
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        registrationId={registrationId}
      />
      <ShowRubricKey
        caption="Question rubric"
        rubric={qnumRubricKey}
        showCompletenessAgainst={showCompletenessAgainst}
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        registrationId={registrationId}
      />
      <ShowRubricKey
        caption="Part rubric"
        rubric={pnumRubricKey}
        showCompletenessAgainst={showCompletenessAgainst}
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        registrationId={registrationId}
      />
      <ShowRubricKey
        caption="Item rubric"
        rubric={bnumRubricKey}
        showCompletenessAgainst={showCompletenessAgainst}
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        registrationId={registrationId}
      />
    </>
  );
};
