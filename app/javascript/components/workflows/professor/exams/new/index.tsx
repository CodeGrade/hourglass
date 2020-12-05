import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AlertContext } from '@hourglass/common/alerts';
import { useMutation, graphql } from 'relay-hooks';
import { DateTime } from 'luxon';
import {
  Card,
  Form,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import { NumericInput } from '@hourglass/common/NumericInput';
import DateTimePicker from './DateTimePicker';
import { newExamMutation } from './__generated__/newExamMutation.graphql';

const NewExamForm: React.FC<{
  courseId: string;
}> = (props) => {
  const { courseId } = props;
  const { alert } = useContext(AlertContext);
  const history = useHistory();
  const [mutate, { loading }] = useMutation<newExamMutation>(
    graphql`
    mutation newExamMutation($input: CreateExamInput!) {
      createExam(input: $input) {
        exam {
          id
        }
      }
    }
    `,
    {
      onCompleted: ({ createExam }) => {
        const { exam } = createExam;
        history.push(`/exams/${exam.id}/admin`);
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error creating exam.',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const today = DateTime.local().startOf('day');
  const todayEnd = today.endOf('day');
  const [name, setName] = useState<string>('');
  const [start, setStart] = useState<DateTime>(today);
  const [end, setEnd] = useState<DateTime>(todayEnd);
  const [duration, setDuration] = useState<number | string>('5');

  return (
    <>
      <h2>New Exam</h2>
      <Card className="mb-4">
        <Card.Body>
          <Form.Group as={Row} controlId="examTitle" className="align-items-center">
            <Form.Label column sm={2}>
              Exam name:
            </Form.Label>
            <Col>
              <Form.Control
                disabled={loading}
                type="input"
                value={name}
                onChange={(e): void => setName(e.target.value)}
              />
            </Col>
            <span className="float-right">
              <Button
                disabled={loading}
                variant="danger"
                onClick={(): void => {
                  history.push(`/courses/${courseId}`);
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={loading}
                variant="success"
                className="ml-2"
                onClick={(): void => {
                  mutate({
                    variables: {
                      input: {
                        courseId,
                        name,
                        duration: Number(duration) * 60.0,
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
          <Form.Group as={Row} controlId="examStartTime" className="align-items-center">
            <Form.Label column sm={2}>Start time:</Form.Label>
            <Col>
              <DateTimePicker
                disabled={loading}
                value={start}
                maxValue={end}
                onChange={setStart}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="examEndTime" className="align-items-center">
            <Form.Label column sm={2}>End time:</Form.Label>
            <Col>
              <DateTimePicker
                disabled={loading}
                value={end}
                minValue={start}
                onChange={setEnd}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="examDuration" className="align-items-center">
            <Form.Label column sm={2}>Duration (minutes):</Form.Label>
            <Col>
              <NumericInput
                disabled={loading}
                value={duration}
                min={0}
                onChange={setDuration}
                variant="primary"
              />
            </Col>
          </Form.Group>
        </Card.Body>
      </Card>
    </>
  );
};

export default NewExamForm;
