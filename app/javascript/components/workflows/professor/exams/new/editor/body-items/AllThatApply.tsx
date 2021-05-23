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
import { AllThatApplyInfo, AllThatApplyState, HTMLVal } from '@student/exams/show/types';
import RearrangeableList from '@hourglass/common/rearrangeable';
import Prompted from './Prompted';
import { DestroyButton, DragHandle, EditHTMLVal } from '..';

const EditAnswer: React.FC<{
  value: boolean;
  disabled?: boolean;
  onChange: (newVal: boolean) => void;
}> = (props) => {
  const {
    value,
    disabled = false,
    onChange,
  } = props;
  return (
    <Button
      variant={value ? 'dark' : 'outline-dark'}
      disabled={disabled}
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
  disabled?: boolean;
  handleRef: React.Ref<HTMLElement>;
}> = (props) => {
  const {
    option,
    disabled: parentDisabled = false,
    handleRef,
  } = props;
  const disabled = parentDisabled;
  return (
    <Row className="p-2 align-items-center">
      <Col sm="auto" className="p-0">
        {handleRef && <DragHandle handleRef={handleRef} variant="info" alignmentClass="" />}
      </Col>
      <Col className="flex-grow-01">
        <EditAnswer
          value={option.answer}
          disabled={disabled}
          onChange={console.log}
        />
      </Col>
      <Col>
        <EditHTMLVal
          className="bg-white border rounded"
          disabled={disabled}
          value={option.option || {
            type: 'HTML',
            value: '',
          }}
          onChange={console.log}
          debounceDelay={1000}
        />
      </Col>
      <Col className="px-0" sm="auto">
        <DestroyButton
          className=""
          disabled={disabled}
          onClick={console.log}
        />
      </Col>
    </Row>
  );
};

const EditOptions: React.FC<{
  options: DraggableATAOption[];
  disabled?: boolean;
  bodyItemId: string;
}> = (props) => {
  const {
    options,
    disabled = false,
    bodyItemId,
  } = props;
  return (
    <>
      <RearrangeableList
        dbArray={options}
        disabled={disabled}
        dropVariant="info"
        identifier={`ATA-${bodyItemId}`}
        onRearrange={console.log}
      >
        {(option, handleRef) => (
          <OneOption
            disabled={disabled}
            option={option}
            handleRef={handleRef}
          />
        )}
      </RearrangeableList>
      <Row className="p-2">
        <Col className="text-center p-0">
          <Button
            variant="dark"
            disabled={disabled}
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
  disabled?: boolean;
  answer: AllThatApplyState;
}> = (props) => {
  const {
    info,
    id,
    disabled = false,
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
        disabled={disabled}
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
            disabled={disabled}
            bodyItemId={id}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default AllThatApply;
