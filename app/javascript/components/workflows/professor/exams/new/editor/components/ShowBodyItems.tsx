import React, { useContext } from 'react';
import {
  Row,
  Col,
  Dropdown,
  DropdownButton,
} from 'react-bootstrap';
import { BodyItemWithAnswer } from '@professor/exams/types';
import { WrappedFieldArrayProps } from 'redux-form';
import BodyItem from '@professor/exams/new/editor/components/BodyItem';
import { languages } from '@professor/exams/new/editor/components/questions/Code';
import { AlertContext } from '@hourglass/common/alerts';
import { useMutation } from 'relay-hooks';
import CREATE_RUBRIC_MUTATION from '@professor/exams/new/editor/components/manageRubrics';
import { manageRubricsCreateRubricMutation } from './__generated__/manageRubricsCreateRubricMutation.graphql';

const ShowBodyItems: React.FC<{
  examVersionId: string;
  qnum: number;
  pnum: number;
} & WrappedFieldArrayProps<BodyItemWithAnswer>> = (props) => {
  const {
    examVersionId,
    qnum,
    pnum,
    fields,
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
  const createNewItem = (item: BodyItemWithAnswer) => {
    createRubric({
      variables: {
        input: {
          examVersionId,
          type: 'none',
          qnum,
          pnum,
          bnum: fields.length,
        },
      },
    }).then((result) => {
      const { rubric } = result.createRubric;
      const b: BodyItemWithAnswer = {
        ...item,
        rubric: {
          type: 'none',
          railsId: rubric.railsId,
        },
      };
      fields.push(b);
    });
  };
  return (
    <>
      <Row>
        <Col>
          {fields.map((member, index) => {
            const moveUp = () => fields.move(index, index - 1);
            const moveDown = () => fields.move(index, index + 1);
            const remove = () => fields.remove(index);
            return (
              <BodyItem
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                memberName={member}
                qnum={qnum}
                pnum={pnum}
                bnum={index}
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
          <DropdownButton
            id={`${qnum}-${pnum}-newBodyItem`}
            disabled={loading}
            variant="secondary"
            title="Add new item..."
          >
            <Dropdown.Item
              onClick={(): void => {
                createNewItem({
                  type: 'HTML',
                  value: '',
                  answer: { NO_ANS: true },
                });
              }}
            >
              Text instructions
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item
              onClick={(): void => {
                createNewItem({
                  type: 'AllThatApply',
                  prompt: {
                    type: 'HTML',
                    value: '',
                  },
                  options: [],
                });
              }}
            >
              All that apply
            </Dropdown.Item>
            <Dropdown.Item
              onClick={(): void => {
                createNewItem({
                  type: 'Code',
                  lang: Object.keys(languages)[0],
                  prompt: {
                    type: 'HTML',
                    value: '',
                  },
                  answer: {
                    text: '',
                    marks: [],
                  },
                });
              }}
            >
              Code
            </Dropdown.Item>
            <Dropdown.Item
              onClick={(): void => {
                createNewItem({
                  type: 'CodeTag',
                  choices: 'exam',
                  prompt: {
                    type: 'HTML',
                    value: '',
                  },
                });
              }}
            >
              Code tag
            </Dropdown.Item>
            <Dropdown.Item
              onClick={(): void => {
                createNewItem({
                  type: 'Matching',
                  prompt: {
                    type: 'HTML',
                    value: '',
                  },
                  prompts: [],
                  values: [],
                });
              }}
            >
              Matching
            </Dropdown.Item>
            <Dropdown.Item
              onClick={(): void => {
                createNewItem({
                  type: 'MultipleChoice',
                  prompt: {
                    type: 'HTML',
                    value: '',
                  },
                  options: [],
                });
              }}
            >
              Multiple choice
            </Dropdown.Item>
            <Dropdown.Item
              onClick={(): void => {
                createNewItem({
                  type: 'Text',
                  prompt: {
                    type: 'HTML',
                    value: '',
                  },
                  answer: '',
                });
              }}
            >
              Free-response
            </Dropdown.Item>
            <Dropdown.Item
              onClick={(): void => {
                createNewItem({
                  type: 'YesNo',
                  yesLabel: 'Yes',
                  noLabel: 'No',
                  prompt: {
                    type: 'HTML',
                    value: '',
                  },
                });
              }}
            >
              Yes/No or True/False
            </Dropdown.Item>
          </DropdownButton>
        </Col>
      </Row>
    </>
  );
};

export default ShowBodyItems;
