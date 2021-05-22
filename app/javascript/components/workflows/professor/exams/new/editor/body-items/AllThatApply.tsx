import React from 'react';
import {
  Form,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import Icon from '@student/exams/show/components/Icon';
import { FaCheck } from 'react-icons/fa';
import { GrDrag } from 'react-icons/gr';
import { AllThatApplyInfo, AllThatApplyState, HTMLVal } from '@hourglass/workflows/student/exams/show/types';
import RearrangableList from '@hourglass/common/rearrangeable';
import Prompted from './Prompted';
import { DragHandle, EditHTMLVal } from '..';

const EditAnswer: React.FC<{
  value: boolean;
  onChange: (newVal: boolean) => void;
}> = (props) => {
  const {
    value,
    onChange,
  } = props;
  return (
    <Button
      variant={value ? 'dark' : 'outline-dark'}
      onClick={() => onChange(!value)}
    >
      <Icon I={FaCheck} className={value ? '' : 'invisible'} />
    </Button>
  );
};

type DraggableATAOption = {
  id: string;
  option: HTMLVal;
  answer: boolean;
}

const OneOption: React.FC<{
  option: DraggableATAOption;
  handleRef: React.Ref<HTMLElement>;
}> = (props) => {
  const {
    option,
    handleRef,
  } = props;
  return (
    <Row className="p-2 align-items-center">
      <Col sm="auto" className="p-0">
        {handleRef && <DragHandle handleRef={handleRef} variant="info" alignmentClass="" />}
      </Col>
      <Col className="flex-grow-01">
        <EditAnswer
          value={option.answer}
          onChange={console.log}
        />
      </Col>
      <Col className="pr-0">
        <EditHTMLVal
          className="bg-white border rounded"
          // disabled={loading || disabled}
          value={option.option || {
            type: 'HTML',
            value: '',
          }}
          onChange={console.log}
          debounceDelay={1000}
        />
      </Col>
    </Row>
  );
};

const EditOptions: React.FC<{
  options: DraggableATAOption[];
  bodyItemId: string;
}> = (props) => {
  const {
    options,
    bodyItemId,
  } = props;
  return (
    <>
      <RearrangableList
        dbArray={options}
        identifier={`ATA-${bodyItemId}`}
        onRearrange={console.log}
      >
        {(option, handleRef) => (
          <OneOption
            option={option}
            handleRef={handleRef}
          />
        )}
      </RearrangableList>
      <Row className="p-2">
        <Col className="text-center p-0">
          <Button
            variant="dark"
            onClick={console.log}
          >
            Add new option
          </Button>
        </Col>
      </Row>
    </>
  );
};

const AllThatApply: React.FC<{
  info: AllThatApplyInfo;
  id: string;
  answer: AllThatApplyState;
}> = (props) => {
  const {
    info,
    id,
    answer,
  } = props;
  const zipped: DraggableATAOption[] = info.options.map((option, index) => ({
    option,
    answer: answer[index],
    id: index.toString(),
  }));
  return (
    <>
      <Prompted
        value={info.prompt}
        onChange={console.log}
      />
      <Form.Group as={Row}>
        <Form.Label column sm={2}>Answers</Form.Label>
        <Col sm={10}>
          <Row className="p-2 align-items-center">
            <Col className="flex-grow-01 text-nowrap">
              <span className="btn btn-sm invisible">
                <Icon I={GrDrag} />
              </span>
              <b>Correct?</b>
            </Col>
            <Col><b>Prompt</b></Col>
          </Row>
          <EditOptions
            options={zipped}
            bodyItemId={id}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default AllThatApply;
