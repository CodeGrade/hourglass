import React, { useContext, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { AlertContext } from '@hourglass/common/alerts';
import { useMutation, graphql } from 'relay-hooks';
import { DateTime } from 'luxon';
import { Card, Form, Row, Col, Button } from 'react-bootstrap';
import DateTimePicker from './DateTimePicker';

const NewExamForm: React.FC<{
  courseId: string;
}> = (props) => {
  const { courseId: courseRailsId } = useParams();
  const { courseId } = props;
  const { alert } = useContext(AlertContext);
  const history = useHistory();
  const [mutate, { loading }] = useMutation(
    graphql`
    mutation newExamMutation($input: CreateExamInput!) {
      createExam(input: $input) {
        errors
        exam {
          railsId
        }
      }
    }
    `,
    {
      onCompleted: ({ createExam }) => {
        const { exam, errors } = createExam;
        if (errors.length !== 0) {
          alert({
            variant: 'danger',
            title: 'Error creating exam.',
            message: errors.join('\n'),
          });
        } else {
          history.push(`/exams/${exam.railsId}/admin`);
        }
      },
    },
  );
  const tomorrow = DateTime.local().plus({ days: 1 }).startOf('day');
  const tomorrowEnd = tomorrow.endOf('day');
  const [name, setName] = useState<string>('');
  const [start, setStart] = useState<DateTime>(tomorrow);
  const [end, setEnd] = useState<DateTime>(tomorrowEnd);
  const [duration, setDuration] = useState<number>(300);

  return (
    <>
      <h2>New Exam</h2>
      <Card className="mb-4">
        <Card.Body>
          <Form.Group as={Row} controlId="examTitle">
            <Form.Label column sm={2}>
              Exam name:
            </Form.Label>
            <Col>
              <Form.Control
                type="input"
                value={name}
                onChange={(e): void => setName(e.target.value)}
              />
            </Col>
            <span className="float-right">
              <Button
                variant="danger"
                onClick={(): void => {
                  history.push(`/courses/${courseRailsId}`);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                className="ml-2"
                onClick={(): void => {
                  mutate({
                    variables: {
                      input: {
                        courseId,
                        name,
                        duration,
                        startTime: start.toISO(),
                        endTime: end.toISO(),
                      },
                    },
                  });
                }}
              >
                Save
              </Button>
            </span>
            <div className="col flex-grow-0 pl-0" />
          </Form.Group>
          <Form.Group as={Row} controlId="examStartTime">
            <Form.Label column sm={2}>Start time:</Form.Label>
            <Col>
              <DateTimePicker
                value={start}
                maxValue={end}
                onChange={setStart}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="examEndTime">
            <Form.Label column sm={2}>End time:</Form.Label>
            <Col>
              <DateTimePicker
                value={end}
                minValue={start}
                onChange={setEnd}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="examDuration">
            <Form.Label column sm={2}>Duration (minutes):</Form.Label>
            <Col>
              <Form.Control
                type="number"
                value={duration / 60.0}
                onChange={(e): void => setDuration(Number(e.target.value) * 60)}
              />
            </Col>
          </Form.Group>
        </Card.Body>
      </Card>
    </>
  );
};

export default NewExamForm;
