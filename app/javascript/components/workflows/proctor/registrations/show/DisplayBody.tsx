import React, { useContext } from 'react';
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
import ShowRubric from '@proctor/registrations/show/ShowRubric';
import {
  CurrentGrading,
  RubricJson,
  CommentJson,
  RubricPresetJson,
} from '@professor/exams/types';
import { Alert, Button } from 'react-bootstrap';
import { variantForPoints, iconForPoints } from '@hourglass/workflows/grading';
import Icon from '@student/exams/show/components/Icon';
import ErrorBoundary from '@hourglass/common/boundary';

export interface BodyProps {
  refreshCodeMirrorsDeps: React.DependencyList;
  body: BodyItem;
  qnum: number;
  pnum: number;
  bnum: number;
  currentGrading?: CurrentGrading[number][number]['body'][number];
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
          <ShowComment key={pc.railsId} comment={pc} />
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
    body,
    qnum,
    pnum,
    bnum,
    currentGrading,
  } = props;
  const {
    answers,
    rubric,
  } = useContext(ExamViewerContext);
  const answer = answers.answers[qnum]?.[pnum]?.[bnum];
  const value = isNoAns(answer) ? undefined : answer;
  const bRubric = rubric?.questions[qnum]?.parts[pnum]?.body[bnum];

  switch (body.type) {
    case 'HTML':
      return <HTML value={body} />;
    case 'Code':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayCode
            info={body}
            value={value as CodeState}
            refreshProps={refreshCodeMirrorsDeps}
          />
          {bRubric && <ShowRubric rubric={bRubric} />}
          {currentGrading && <ShowCurrentGrading currentGrading={currentGrading} />}
        </Prompted>
      );
    case 'AllThatApply':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayAllThatApply info={body} value={value as AllThatApplyState} />
          {bRubric && <ShowRubric rubric={bRubric} />}
          {currentGrading && <ShowCurrentGrading currentGrading={currentGrading} />}
        </Prompted>
      );
    case 'CodeTag':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayCodeTag info={body} value={value as CodeTagState} />
          {bRubric && <ShowRubric rubric={bRubric} />}
          {currentGrading && <ShowCurrentGrading currentGrading={currentGrading} />}
        </Prompted>
      );
    case 'YesNo':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayYesNo info={body} value={value as YesNoState} />
          {bRubric && <ShowRubric rubric={bRubric} />}
          {currentGrading && <ShowCurrentGrading currentGrading={currentGrading} />}
        </Prompted>
      );
    case 'MultipleChoice':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayMultipleChoice info={body} value={value as MultipleChoiceState} />
          {bRubric && <ShowRubric rubric={bRubric} />}
          {currentGrading && <ShowCurrentGrading currentGrading={currentGrading} />}
        </Prompted>
      );
    case 'Text':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayText info={body} value={value as TextState} />
          {bRubric && <ShowRubric rubric={bRubric} />}
          {currentGrading && <ShowCurrentGrading currentGrading={currentGrading} />}
        </Prompted>
      );
    case 'Matching':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayMatching info={body} value={value as MatchingState} />
          {bRubric && <ShowRubric rubric={bRubric} />}
          {currentGrading && <ShowCurrentGrading currentGrading={currentGrading} />}
        </Prompted>
      );
    default:
      throw new ExhaustiveSwitchError(body);
  }
};

export default DisplayBody;
