import React from 'react';
import BodyItem from '@professor/exams/new/editor/containers/BodyItem';
import {
  Row,
  Col,
  Dropdown,
  DropdownButton,
} from 'react-bootstrap';
import { BodyItem as BodyItemInfo } from '@student/exams/show/types';

export interface BodyItemsProps {
  qnum: number;
  pnum: number;
  numBodyItems: number;
  addBodyItem: (bnum: number, info: BodyItemInfo) => void;
}

const ShowBodyItems: React.FC<BodyItemsProps> = (props) => {
  const {
    qnum,
    pnum,
    numBodyItems,
    addBodyItem,
  } = props;
  return (
    <>
      {Array.from(Array(numBodyItems).keys()).map((_, bnum) => (
        // eslint-disable-next-line react/no-array-index-key
        <BodyItem key={bnum} qnum={qnum} pnum={pnum} bnum={bnum} numBodyItems={numBodyItems} />
      ))}
      <Row className="text-center">
        <Col>
          <DropdownButton
            id={`${qnum}-${pnum}-newBodyItem`}
            variant="secondary"
            title="Add new item..."
          >
            <Dropdown.Item
              onClick={(): void => {
                addBodyItem(numBodyItems, {
                  type: 'HTML',
                  value: '',
                });
              }}
            >
              Text instructions
            </Dropdown.Item>
            <Dropdown.Item
              onClick={(): void => {
                addBodyItem(numBodyItems, {
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
                addBodyItem(numBodyItems, {
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
                addBodyItem(numBodyItems, {
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
                addBodyItem(numBodyItems, {
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
                addBodyItem(numBodyItems, {
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
                addBodyItem(numBodyItems, {
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
                addBodyItem(numBodyItems, {
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
