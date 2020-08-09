import React from 'react';
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

const ShowBodyItems: React.FC<{
  qnum: number;
  pnum: number;
} & WrappedFieldArrayProps<BodyItemWithAnswer>> = (props) => {
  const {
    qnum,
    pnum,
    fields,
  } = props;
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
            variant="secondary"
            title="Add new item..."
          >
            <Dropdown.Item
              onClick={(): void => {
                fields.push({
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
                fields.push({
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
                fields.push({
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
                fields.push({
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
                fields.push({
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
                fields.push({
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
                fields.push({
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
                fields.push({
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
