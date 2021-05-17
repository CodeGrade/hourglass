import React, { useContext } from 'react';
import {
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import { WrappedFieldArrayProps } from 'redux-form';
import { useMutation } from 'relay-hooks';
import { useRefresher } from '@hourglass/common/helpers';
import { PartInfoWithAnswers } from '@professor/exams/types';
import Part from '@professor/exams/new/editor/components/Part';
import { AlertContext } from '@hourglass/common/alerts';
import CREATE_RUBRIC_MUTATION from '@professor/exams/new/editor/components/manageRubrics';
import { manageRubricsCreateRubricMutation } from './__generated__/manageRubricsCreateRubricMutation.graphql';

const ShowParts: React.FC<{
  qnum: number;
  examVersionId: string;
} & WrappedFieldArrayProps<PartInfoWithAnswers>> = (props) => {
  const {
    qnum,
    examVersionId,
    fields,
  } = props;
  const { alert } = useContext(AlertContext);
  const [refresher, refresh] = useRefresher();
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
      <Row>
        <Col>
          {fields.map((member, index) => {
            const moveUp = () => {
              refresh();
              fields.move(index, index - 1);
            };
            const moveDown = () => {
              refresh();
              fields.move(index, index + 1);
            };
            const remove = () => {
              refresh();
              fields.remove(index);
            };
            return (
              <Part
                // eslint-disable-next-line react/no-array-index-key
                key={`${refresher}-${index}`}
                examVersionId={examVersionId}
                qnum={qnum}
                pnum={index}
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
            variant="success"
            disabled={loading}
            onClick={(): void => {
              createRubric({
                variables: {
                  input: {
                    examVersionId,
                    type: 'none',
                    qnum,
                    pnum: fields.length,
                  },
                },
              }).then((result) => {
                const { rubric } = result.createRubric;
                const p: PartInfoWithAnswers = {
                  references: [],
                  name: {
                    type: 'HTML',
                    value: '',
                  },
                  description: {
                    type: 'HTML',
                    value: '',
                  },
                  points: 0,
                  bodyItems: [],
                  partRubric: {
                    type: 'none',
                    railsId: rubric.railsId,
                  },
                };
                fields.push(p);
              });
            }}
          >
            Add part
          </Button>
        </Col>
      </Row>
    </>

  );
};

export default ShowParts;
