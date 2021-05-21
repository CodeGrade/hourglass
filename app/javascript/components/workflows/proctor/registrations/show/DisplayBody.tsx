import React, { useContext, useState } from 'react';
import { graphql, useFragment } from 'relay-hooks';
import { ExamViewerContext } from '@hourglass/common/context';
import DisplayCode from '@proctor/registrations/show/questions/DisplayCode';
import DisplayYesNo from '@proctor/registrations/show/questions/DisplayYesNo';
import DisplayCodeTag from '@proctor/registrations/show/questions/DisplayCodeTag';
import DisplayText from '@proctor/registrations/show/questions/DisplayText';
import DisplayMatching from '@proctor/registrations/show/questions/DisplayMatching';
import DisplayMultipleChoice from '@proctor/registrations/show/questions/DisplayMultipleChoice';
import DisplayAllThatApply from '@proctor/registrations/show/questions/DisplayAllThatApply';
import HTML from '@student/exams/show/components/HTML';
import {
  CodeState, TextState, YesNoState, MultipleChoiceState,
  MatchingState, AllThatApplyState, CodeTagState, BodyItem,
} from '@student/exams/show/types';
import { ExhaustiveSwitchError, pluralize } from '@hourglass/common/helpers';
import { isNoAns } from '@student/exams/show/containers/questions/connectors';
import Prompted from '@proctor/registrations/show/questions/Prompted';
import { ShowRubricKey } from '@proctor/registrations/show/ShowRubric';
import {
  CurrentGrading,
  RubricJson,
  CommentJson,
  RubricPresetJson,
} from '@professor/exams/types';
import {
  Alert,
  Button,
  Card,
  Collapse,
} from 'react-bootstrap';
import { variantForPoints, iconForPoints } from '@hourglass/workflows/grading';
import Icon from '@student/exams/show/components/Icon';
import ErrorBoundary from '@hourglass/common/boundary';

import { DisplayBody$key } from './__generated__/DisplayBody.graphql';

export interface BodyProps {
  bodyKey: DisplayBody$key;
  refreshCodeMirrorsDeps: React.DependencyList;
  qnum: number;
  pnum: number;
  bnum: number;
  currentGrading?: CurrentGrading[number][number]['body'][number];
  fullyExpandCode: boolean;
  overviewMode: boolean;
}

const ShowComment: React.FC<{ comment: CommentJson }> = (props) => {
  const { comment } = props;
  const { grader, points, message } = comment;
  return (
    <p>
      <Button
        disabled
        variant={variantForPoints(points)}
        size="sm"
        className="mr-2 align-self-center"
      >
        <Icon I={iconForPoints(points)} className="mr-2" />
        {pluralize(points, 'point', 'points')}
      </Button>
      <span className="float-right text-muted">{`(${grader})`}</span>
      <span>{message}</span>
    </p>
  );
};

const ShowRubricPreset: React.FC<{ preset: RubricPresetJson, points: number}> = (props) => {
  const { preset, points } = props;
  const { info, values } = preset;
  const { label, direction } = info;
  const prefix = label ? `${label}: ` : '';
  let caption;
  if (points !== undefined) {
    if (direction === 'credit') {
      caption = `${prefix} Up to ${pluralize(points, 'point', 'points')}, counting up`;
    } else {
      caption = `${prefix} At most ${pluralize(points, 'point', 'points')}, counting down`;
    }
  }
  return (
    <div>
      {caption && (
        <p className="d-flex">
          <span className="ml-auto">
            {caption}
          </span>
        </p>
      )}
      {Object.keys(values).map((rId) => {
        const presetComment = values[rId];
        return presetComment.values.map((pc) => (
          <ShowComment key={pc.id} comment={pc} />
        ));
      })}
    </div>
  );
};

const ShowRubricJson: React.FC<{
  rubric: RubricJson | RubricPresetJson;
  points?: number;
}> = (props) => {
  const { rubric, points } = props;
  if (rubric.type === 'rubric_preset') {
    return <ShowRubricPreset preset={rubric} points={points} />;
  }
  const { info, values } = rubric;
  return (
    <Alert variant="dark" className="rubric p-2">
      {Object.keys(values).map((rId) => (
        <ShowRubricJson
          key={rId}
          rubric={values[rId]}
          points={info?.points ?? points}
        />
      ))}
    </Alert>
  );
};

const ShowCurrentGrading: React.FC<{
  currentGrading: CurrentGrading[number][number]['body'][number];
}> = (props) => {
  const { currentGrading } = props;
  const { grouped, checks } = currentGrading;
  if (Object.keys(grouped).length === 0 && checks.length === 0) return null;
  return (
    <Alert variant="dark" className="rubric p-2">
      {checks.map((c, i) => {
        const { points, grader } = c;
        return (
          // When showing an exam, checks are static
          // eslint-disable-next-line react/no-array-index-key
          <p key={i}>
            <Button
              disabled
              variant={variantForPoints(points)}
              size="sm"
              className="mr-2 align-self-center"
            >
              <Icon I={iconForPoints(points)} className="mr-2" />
              {pluralize(points, 'point', 'points')}
            </Button>
            <span className="float-right text-muted">{`(${grader})`}</span>
          </p>
        );
      })}
      <ErrorBoundary>
        {Object.keys(grouped).map((rId) => {
          const rubric = grouped[rId];
          return <ShowRubricJson rubric={rubric} key={rId} />;
        })}
      </ErrorBoundary>
    </Alert>
  );
};

const DisplayBody: React.FC<BodyProps> = (props) => {
  const {
    refreshCodeMirrorsDeps,
    bodyKey,
    qnum,
    pnum,
    bnum,
    currentGrading,
    fullyExpandCode,
    overviewMode,
  } = props;
  const res = useFragment<DisplayBody$key>(
    graphql`
    fragment DisplayBody on BodyItem {
      id
      info
      rootRubric @include(if: $withRubric) { ...ShowRubricKey }
    }
    `,
    bodyKey,
  );
  const body = res as BodyItem;
  const bRubric = res.rootRubric;
  const {
    answers,
  } = useContext(ExamViewerContext);
  const [open, setOpen] = useState(false);
  const answer = answers.answers[qnum]?.[pnum]?.[bnum];
  const value = isNoAns(answer) ? undefined : answer;

  switch (body.info.type) {
    case 'HTML':
      return <HTML value={body.info} />;
    case 'Code': {
      let initial = null;
      if (overviewMode && body.info.initial) {
        initial = (
          <Card bg="secondary" border="info" className="mt-2 mb-3">
            <Card.Header
              as="p"
              role="button"
              onClick={() => setOpen((o) => !o)}
              onKeyPress={() => setOpen((o) => !o)}
              tabIndex={0}
            >
              Starter:
            </Card.Header>
            <Collapse in={open}>
              <Card.Body>
                <DisplayCode
                  info={body.info}
                  value={null}
                  refreshProps={[...refreshCodeMirrorsDeps, open]}
                  fullyExpandCode={fullyExpandCode}
                />
              </Card.Body>
            </Collapse>
          </Card>
        );
      }
      return (
        <Prompted prompt={body.info.prompt}>
          {initial}
          <DisplayCode
            info={body.info}
            value={value as CodeState}
            refreshProps={refreshCodeMirrorsDeps}
            fullyExpandCode={fullyExpandCode}
          />
          {bRubric && overviewMode && <ShowRubricKey rubricKey={bRubric} forWhat="item" />}
          {currentGrading && <ShowCurrentGrading currentGrading={currentGrading} />}
        </Prompted>
      );
    }
    case 'AllThatApply':
      return (
        <Prompted prompt={body.info.prompt}>
          <DisplayAllThatApply info={body.info} value={value as AllThatApplyState} />
          {bRubric && overviewMode && <ShowRubricKey rubricKey={bRubric} forWhat="item" />}
          {currentGrading && <ShowCurrentGrading currentGrading={currentGrading} />}
        </Prompted>
      );
    case 'CodeTag':
      return (
        <Prompted prompt={body.info.prompt}>
          <DisplayCodeTag info={body.info} value={value as CodeTagState} />
          {bRubric && overviewMode && <ShowRubricKey rubricKey={bRubric} forWhat="item" />}
          {currentGrading && <ShowCurrentGrading currentGrading={currentGrading} />}
        </Prompted>
      );
    case 'YesNo':
      return (
        <Prompted prompt={body.info.prompt}>
          <DisplayYesNo info={body.info} value={value as YesNoState} />
          {bRubric && overviewMode && <ShowRubricKey rubricKey={bRubric} forWhat="item" />}
          {currentGrading && <ShowCurrentGrading currentGrading={currentGrading} />}
        </Prompted>
      );
    case 'MultipleChoice':
      return (
        <Prompted prompt={body.info.prompt}>
          <DisplayMultipleChoice info={body.info} value={value as MultipleChoiceState} />
          {bRubric && overviewMode && <ShowRubricKey rubricKey={bRubric} forWhat="item" />}
          {currentGrading && <ShowCurrentGrading currentGrading={currentGrading} />}
        </Prompted>
      );
    case 'Text':
      return (
        <Prompted prompt={body.info.prompt}>
          <DisplayText info={body.info} value={value as TextState} />
          {bRubric && overviewMode && <ShowRubricKey rubricKey={bRubric} forWhat="item" />}
          {currentGrading && <ShowCurrentGrading currentGrading={currentGrading} />}
        </Prompted>
      );
    case 'Matching':
      return (
        <Prompted prompt={body.info.prompt}>
          <DisplayMatching info={body.info} value={value as MatchingState} />
          {bRubric && overviewMode && <ShowRubricKey rubricKey={bRubric} forWhat="item" />}
          {currentGrading && <ShowCurrentGrading currentGrading={currentGrading} />}
        </Prompted>
      );
    default:
      throw new ExhaustiveSwitchError(body.info);
  }
};

export default DisplayBody;
