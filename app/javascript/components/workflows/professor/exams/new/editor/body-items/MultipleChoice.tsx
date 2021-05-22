import React from 'react';
import {
  Form,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import Prompted from '@professor/exams/new/editor/body-items/Prompted';
import Icon from '@student/exams/show/components/Icon';
import { FaCircle } from 'react-icons/fa';
import { GrDrag } from 'react-icons/gr';
import { HTMLVal, MultipleChoiceInfo, MultipleChoiceState } from '@student/exams/show/types';
import RearrangableList from '@hourglass/common/rearrangeable';
import { DragHandle, EditHTMLVal } from '..';

interface DraggableMCOption {
  id: string;
  option: HTMLVal;
  selected: boolean;
}

const OneOption: React.FC<{
  option: DraggableMCOption;
  handleRef: React.Ref<HTMLElement>;
}> = (props) => {
  const {
    option,
    handleRef,
  } = props;
  return (
    <Row className="p-2 align-items-center">
      <Col sm="auto" className="p-0">
        {handleRef && <DragHandle handleRef={handleRef} variant="info" alignmentClass="m-0" />}
      </Col>
      <Col className="flex-grow-01">
        <Button
          variant={option.selected ? 'dark' : 'outline-dark'}
          onClick={console.log}
        >
          <Icon I={FaCircle} className={option.selected ? '' : 'invisible'} />
        </Button>
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

const EditAns: React.FC<{
  options: DraggableMCOption[];
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
        identifier={`MC-${bodyItemId}`}
        onRearrange={console.log}
      >
        {(option, handleRef) => (
          <OneOption
            option={option}
            handleRef={handleRef}
          />
        )}
      </RearrangableList>
    </>
  );
};

interface MultipleChoiceProps {
  info: MultipleChoiceInfo;
  id: string;
  answer: MultipleChoiceState;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = (props) => {
  const {
    info,
    id,
    answer,
  } = props;
  const zipped: DraggableMCOption[] = info.options.map((option, index) => ({
    option,
    id: index.toString(),
    selected: index === answer,
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
          <Row className="p-2">
            <Col sm="auto" className="p-0">
              <span className="btn btn-sm invisible">
                <Icon I={GrDrag} />
              </span>
            </Col>
            <Col className="flex-grow-01">
              <b>Correct?</b>
            </Col>
            <Col><b>Prompt</b></Col>
          </Row>
          <EditAns
            bodyItemId={id}
            options={zipped}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default MultipleChoice;
