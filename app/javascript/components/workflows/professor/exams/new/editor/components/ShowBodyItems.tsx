import React from 'react';
import {
  Row,
  Col,
  Dropdown,
  DropdownButton,
} from 'react-bootstrap';
import { BodyItem as BodyItemInfo } from '@student/exams/show/types';
import { WrappedFieldArrayProps } from 'redux-form';
// import BodyItem from '@professor/exams/new/editor/containers/BodyItem';

const ShowBodyItems: React.FC<{
  qnum: number;
  pnum: number;
} & WrappedFieldArrayProps<BodyItemInfo>> = (props) => {
  const {
    qnum,
    pnum,
    fields,
  } = props;
  return (
    <>
      <Row>
        <Col>
          {fields.map((member, index) => (
            <p
              // eslint-disable-next-line react/no-array-index-key
              key={index}
            >
              TODO: BodyItem ({member})
            </p>
          ))}
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
                });
              }}
            >
              Text instructions
            </Dropdown.Item>
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
                  initial: '',
                  lang: 'text/plain',
                  prompt: {
                    type: 'HTML',
                    value: '',
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
