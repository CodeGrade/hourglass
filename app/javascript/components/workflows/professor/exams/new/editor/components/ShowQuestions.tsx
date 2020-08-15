import React, { useContext } from 'react';
import { WrappedFieldArrayProps } from 'redux-form';
import {
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import { QuestionInfoWithAnswers } from '@professor/exams/types';
import Question from '@professor/exams/new/editor/components/Question';
import { AlertContext } from '@hourglass/common/alerts';
import { useMutation } from 'relay-hooks';
import CREATE_RUBRIC_MUTATION from '@professor/exams/new/editor/components/manageRubrics';
import { manageRubricsCreateRubricMutation } from './__generated__/manageRubricsCreateRubricMutation.graphql';

const ShowQuestions: React.FC<{
  examVersionId: string;
} & WrappedFieldArrayProps<QuestionInfoWithAnswers>> = (props) => {
  const {
    fields,
    examVersionId,
  } = props;
  const { alert } = useContext(AlertContext);
  const [createRubric, { loading }] = useMutation<manageRubricsCreateRubricMutation>(
    CREATE_RUBRIC_MUTATION,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error creating rubric for new question.',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  return (
    <>
      <Row className="py-3">
        <Col>
          {fields.map((member, index) => {
            const moveUp = () => fields.move(index, index - 1);
            const moveDown = () => fields.move(index, index + 1);
            const remove = () => fields.remove(index);
            return (
              <Question
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                examVersionId={examVersionId}
                qnum={index}
                memberName={member}
                enableDown={index + 1 < fields.length}
                moveDown={moveDown}
                moveUp={moveUp}
                remove={remove}
              />
            );
          })}
        </Col>
      </Row>
      <Row className="text-center">
        <Col>
          <Button
            variant="primary"
            disabled={loading}
            onClick={(): void => {
              createRubric({
                variables: {
                  input: {
                    examVersionId,
                    type: 'none',
                    qnum: fields.length,
                  },
                },
              }).then((result) => {
                const { rubric } = result.createRubric;
                const q: QuestionInfoWithAnswers = {
                  reference: [],
                  name: {
                    type: 'HTML',
                    value: '',
                  },
                  description: {
                    type: 'HTML',
                    value: '',
                  },
                  parts: [],
                  separateSubparts: false,
                  questionRubric: {
                    type: 'none',
                    railsId: rubric.railsId,
                  },
                };
                fields.push(q);
              });
            }}
          >
            Add question
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default ShowQuestions;
