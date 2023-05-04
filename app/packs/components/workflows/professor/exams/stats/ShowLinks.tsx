import React from 'react';
import {
  Alert,
  Button,
  Modal,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Icon from '@student/exams/show/components/Icon';
import { iconForPoints, variantForPoints } from '@hourglass/workflows/grading';
import { pluralize } from '@hourglass/common/helpers';
import { IconType } from 'react-icons';
import { RiMessage2Line } from 'react-icons/ri';
import { RubricPresetHistograms } from './__generated__/RubricPresetHistograms.graphql';
import { GradingComment, PresetUsageData } from './utils';

export const ShowLinks: React.FC<{
  examId: string,
  comments: { comment: GradingComment, registration: RubricPresetHistograms['registrations'][number] }[],
  presetUsage: PresetUsageData,
  preset: GradingComment['presetComment'],
  title: string,
  show: boolean,
  qnum: number,
  pnum: number,
  singlePart: boolean,
  onClose: () => void,
}> = (props) => {
  const {
    examId,
    presetUsage,
    preset,
    comments,
    title,
    show,
    qnum,
    pnum,
    singlePart,
    onClose,
  } = props;
  return (
    <Modal
      size="xl"
      centered
      keyboard
      scrollable
      show={show}
      onHide={onClose}
    >
      <Modal.Header closeButton>
        <p style={{ whiteSpace: 'nowrap' }} className="pr-2">{title}</p>
        <span className="w-100">
          <RenderPreset
            value={presetUsage}
            graderHint={preset?.graderHint}
            points={preset?.points}
            studentFeedback={preset?.studentFeedback}
            variant={variantForPoints(preset?.points)}
            VariantIcon={iconForPoints(preset?.points)}
          />
        </span>
      </Modal.Header>
      <Modal.Body>
        <table>
          {comments.map(({ comment, registration }) => {
            const anchor = singlePart ? `question-${qnum}` : `question-${qnum}-part-${pnum}`;
            const submissionLink = `/exams/${examId}/submissions/${registration.id}#${anchor}`;
            return (
              <tr>
                <td style={{ whiteSpace: 'nowrap' }} className="pr-3">
                  <Link
                    key={comment.id}
                    target="blank"
                    to={submissionLink}
                  >
                    {`${registration.user.displayName}:`}
                  </Link>
                </td>
                <td className="w-100">
                  <Link
                    key={comment.id}
                    target="blank"
                    to={submissionLink}
                  >
                    <Alert
                      variant={variantForPoints(comment.points)}
                      className="w-100 p-0 m-0 preset"
                    >
                      <Button
                        disabled
                        variant={variantForPoints(comment.points)}
                        size="sm"
                        className="mr-2 align-self-center"
                      >
                        <Icon I={iconForPoints(comment.points)} className="mr-2" />
                        {pluralize(comment.points, 'point', 'points')}
                      </Button>
                      {comment.message}
                    </Alert>
                  </Link>
                </td>
              </tr>
            );
          })}
        </table>
      </Modal.Body>
    </Modal>
  );
};

export const RenderPreset: React.FC<{
  value: PresetUsageData,
  points: number,
  variant: string,
  VariantIcon: IconType,
  graderHint: string,
  studentFeedback: string,
}> = (props) => {
  const {
    value,
    points,
    variant,
    VariantIcon,
    graderHint,
    studentFeedback,
  } = props;
  switch (value.key) {
    case 'placeholder': return null;
    case 'none':
      return (
        <Alert
          variant="info"
          className="p-0 m-0 preset"
        >
          <Button disabled variant="info" size="sm" className="mr-2 align-self-center">
            <Icon I={RiMessage2Line} className="mr-2" />
            ?? points
          </Button>
          Custom (no preset)
        </Alert>
      );
    default:
      return (
        <Alert
          variant={variant}
          className="p-0 m-0 preset"
          style={{
            width: '100%',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          <Button
            disabled
            variant={variant}
            size="sm"
            className="mr-2 align-self-center"
          >
            <Icon I={VariantIcon} className="mr-2" />
            {pluralize(points, 'point', 'points')}
          </Button>
          {studentFeedback ?? graderHint}
        </Alert>
      );
  }
};
