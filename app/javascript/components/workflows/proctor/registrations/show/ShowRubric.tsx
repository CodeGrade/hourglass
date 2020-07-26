import React, { useState } from 'react';
import {
  Rubric,
  Preset,
  isRubricPresets,
  RubricPresets,
  RubricAll,
  RubricAny,
  RubricOne,
} from '@professor/exams/types';
import { ExhaustiveSwitchError, pluralize } from '@hourglass/common/helpers';
import {
  Alert,
  Row,
  Col,
  ButtonGroup,
  Button,
  Collapse,
} from 'react-bootstrap';
import HTML from '@hourglass/workflows/student/exams/show/components/HTML';
import Icon from '@hourglass/workflows/student/exams/show/components/Icon';
import { BsArrowUpRight, BsArrowDownRight } from 'react-icons/bs';
import { variantForPoints, iconForPoints } from '@grading/index';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import Tooltip from '@student/exams/show/components/Tooltip';

const ShowPreset: React.FC<{
  preset: Preset;
  direction: RubricPresets['direction'];
}> = (props) => {
  const {
    preset,
    direction,
  } = props;
  const {
    label,
    graderHint,
    studentFeedback,
    points,
  } = preset;
  return (
    <Alert variant={direction === 'credit' ? 'success' : 'danger'} className="p-0">
      <Button
        disabled
        variant={variantForPoints(points)}
        size="sm"
        className="mr-2 align-self-center"
      >
        <Icon I={iconForPoints(points)} className="mr-2" />
        {pluralize(points, 'point', 'points')}
      </Button>
      {label && <span>{`[${label}]`}</span>}
      <HTML value={graderHint} className="d-inline-block" />
      {studentFeedback && (
        <Row className="p-2">
          <Col sm="2">
            <i className="mr-2">Sample student message:</i>
          </Col>
          <Col className="border border-info bg-white rounded mr-3">
            <HTML value={studentFeedback} />
          </Col>
        </Row>
      )}
    </Alert>
  );
};

const ShowRubricPresets: React.FC<{ choices: RubricPresets }> = (props) => {
  const { choices } = props;
  const {
    direction,
    label,
    presets,
    mercy,
  } = choices;
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
            // eslint-disable-next-line react/no-array-index-key
            <ShowPreset direction={direction} preset={p} key={index} />
          ))}
        </Col>
      </Row>
    </div>
  );
};

const ShowRubricAll: React.FC<{ rubric: RubricAll }> = (props) => {
  const { rubric } = props;
  const { description, choices } = rubric;
  const [open, setOpen] = useState(false);
  return (
    <div className="rubric">
      <Alert variant="dark">
        <h5>
          <span
            role="button"
            onClick={() => setOpen((o) => !o)}
            onKeyPress={() => setOpen((o) => !o)}
            tabIndex={0}
          >
            Rubric: Choose something from
            <i className="mx-1">all</i>
            entries
            <Icon className="ml-2" I={open ? FaChevronUp : FaChevronDown} />
          </span>
        </h5>
        <Collapse in={open}>
          <div>
            <HTML value={description} />
            {isRubricPresets(choices) ? (
              <ShowRubricPresets choices={choices} />
            ) : (
              <>
                {choices.map((c, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <ShowRubric key={index} rubric={c} />
                ))}
              </>
            )}
          </div>
        </Collapse>
      </Alert>
    </div>
  );
};

const ShowRubricAny: React.FC<{ rubric: RubricAny }> = (props) => {
  const { rubric } = props;
  const { points, description, choices } = rubric;
  const [open, setOpen] = useState(false);
  const pointsMsg = `(${pluralize(points, 'point', 'points')})`;
  return (
    <div className="rubric">
      <Alert variant="dark">
        <h5>
          <span
            role="button"
            onClick={() => setOpen((o) => !o)}
            onKeyPress={() => setOpen((o) => !o)}
            tabIndex={0}
          >
            Rubric: Choose something from
            <i className="mx-1">any</i>
            entries
            <Icon className="ml-2" I={open ? FaChevronUp : FaChevronDown} />
          </span>
          <span className="float-right">{pointsMsg}</span>
        </h5>
        <Collapse in={open}>
          <div>
            <HTML value={description} />
            {isRubricPresets(choices) ? (
              <ShowRubricPresets choices={choices} />
            ) : (
              <>
                {choices.map((c, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <ShowRubric key={index} rubric={c} />
                ))}
              </>
            )}
          </div>
        </Collapse>
      </Alert>
    </div>
  );
};

const ShowRubricOne: React.FC<{ rubric: RubricOne }> = (props) => {
  const { rubric } = props;
  const { points, description, choices } = rubric;
  const [open, setOpen] = useState(false);
  const pointsMsg = `(${pluralize(points, 'point', 'points')})`;
  return (
    <div className="rubric">
      <Alert variant="dark">
        <h5>
          <span
            role="button"
            onClick={() => setOpen((o) => !o)}
            onKeyPress={() => setOpen((o) => !o)}
            tabIndex={0}
          >
            Rubric: Choose something from
            <i className="mx-1">exactly one</i>
            entry
            <Icon className="ml-2" I={open ? FaChevronUp : FaChevronDown} />
          </span>
          <span className="float-right">{pointsMsg}</span>
        </h5>
        <Collapse in={open}>
          <div>
            <HTML value={description} />
            {isRubricPresets(choices) ? (
              <ShowRubricPresets choices={choices} />
            ) : (
              <>
                {choices.map((c, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <ShowRubric key={index} rubric={c} />
                ))}
              </>
            )}
          </div>
        </Collapse>
      </Alert>
    </div>
  );
};

const ShowRubric: React.FC<{ rubric: Rubric }> = (props) => {
  const { rubric } = props;
  switch (rubric.type) {
    case 'none': return <div><i>No rubric</i></div>;
    case 'all': return <ShowRubricAll rubric={rubric} />;
    case 'any': return <ShowRubricAny rubric={rubric} />;
    case 'one': return <ShowRubricOne rubric={rubric} />;
    default:
      throw new ExhaustiveSwitchError(rubric);
  }
};

export default ShowRubric;
