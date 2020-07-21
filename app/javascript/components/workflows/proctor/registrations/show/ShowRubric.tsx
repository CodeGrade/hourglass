import React from 'react';
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
  AlertProps,
} from 'react-bootstrap';
import HTML from '@hourglass/workflows/student/exams/show/components/HTML';
import Icon from '@hourglass/workflows/student/exams/show/components/Icon';
import { BsArrowUpRight, BsArrowDownRight } from 'react-icons/bs';
import { variantForPoints, iconForPoints } from '@grading/index';

const ShowPreset: React.FC<{
  preset: Preset;
  variant: AlertProps['variant'];
}> = (props) => {
  const {
    preset,
    variant = 'info',
  } = props;
  const {
    label,
    graderHint,
    studentFeedback,
    points,
  } = preset;
  return (
    <Alert variant={variant} className="p-0">
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
        <p>
          Sample student message:
          <HTML value={studentFeedback} className="d-inline-block" />
        </p>
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
  return (
    <div>
      <Row>
        <Col>
          <ButtonGroup className="float-right">
            <Button variant="outline-secondary" size="sm" disabled>{label}</Button>
            <Button variant="outline-secondary" size="sm" disabled>
              <Icon I={direction === 'credit' ? BsArrowUpRight : BsArrowDownRight} />
            </Button>
            {mercy && (
              <Button variant="outline-secondary" size="sm" disabled>
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
            <ShowPreset preset={p} key={index} />
          ))}
        </Col>
      </Row>
    </div>
  );
};

const ShowRubricAll: React.FC<{ rubric: RubricAll }> = (props) => {
  const { rubric } = props;
  const { description, choices } = rubric;
  return (
    <div className="rubric">
      <Alert variant="dark">
        <h5>
          Rubric: Choose something from
          <i className="mx-1">all</i>
          entries
        </h5>
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
      </Alert>
    </div>
  );
};

const ShowRubricAny: React.FC<{ rubric: RubricAny }> = (props) => {
  const { rubric } = props;
  const { points, description, choices } = rubric;
  const pointsMsg = `(${pluralize(points, 'point', 'points')})`;
  return (
    <div className="rubric">
      <Alert variant="dark">
        <h5>
          Rubric: Choose something from
          <i className="mx-1">any</i>
          entries
          <span className="float-right">{pointsMsg}</span>
        </h5>
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
      </Alert>
    </div>
  );
};


const ShowRubricOne: React.FC<{ rubric: RubricOne }> = (props) => {
  const { rubric } = props;
  const { points, description, choices } = rubric;
  const pointsMsg = `(${pluralize(points, 'point', 'points')})`;
  return (
    <div className="rubric">
      <Alert variant="dark">
        <h5>
          Rubric: Choose something from
          <i className="mx-1">exactly one</i>
          entry
          <span className="float-right">{pointsMsg}</span>
        </h5>
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
      </Alert>
    </div>
  );
};

const ShowRubric: React.FC<{ rubric: Rubric }> = (props) => {
  const { rubric } = props;
  switch (rubric.type) {
    case 'none': return null;
    case 'all': return <ShowRubricAll rubric={rubric} />;
    case 'any': return <ShowRubricAny rubric={rubric} />;
    case 'one': return <ShowRubricOne rubric={rubric} />;
    default:
      throw new ExhaustiveSwitchError(rubric);
  }
};

export default ShowRubric;
