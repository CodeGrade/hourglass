import React, { useContext } from 'react';
import {
  Form,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import {
  graphql,
  useMutation,
} from 'relay-hooks';
import { FaCircle } from 'react-icons/fa';
import { GrDrag } from 'react-icons/gr';
import Icon from '@student/exams/show/components/Icon';
import { HTMLVal, MultipleChoiceInfo, MultipleChoiceState } from '@student/exams/show/types';
import RearrangeableList from '@hourglass/common/rearrangeable';
import { MutationReturn } from '@hourglass/common/helpers';
import { AlertContext } from '@hourglass/common/alerts';
import Prompted from '@professor/exams/new/editor/body-items/Prompted';
import { DragHandle, DestroyButton, EditHTMLVal } from '@professor/exams/new/editor/components/helpers';
import { MultipleChoiceCreateMutation } from './__generated__/MultipleChoiceCreateMutation.graphql';

export function useCreateMultipleChoiceMutation(): MutationReturn<MultipleChoiceCreateMutation> {
  const { alert } = useContext(AlertContext);
  return useMutation<MultipleChoiceCreateMutation>(
    graphql`
    mutation MultipleChoiceCreateMutation($input: CreateMultipleChoiceInput!) {
      createMultipleChoice(input: $input) {
        part {
          id
          bodyItems {
            id
            ...BodyItemEditor
          }
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error creating new MultipleChoice body item',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
}

interface DraggableMCOption {
  id: string;
  option: HTMLVal;
  selected: boolean;
}

const OneOption: React.FC<{
  option: DraggableMCOption;
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
        {handleRef && <DragHandle handleRef={handleRef} variant="info" alignmentClass="m-0" />}
      </Col>
      <Col className="flex-grow-01">
        <Button
          variant={option.selected ? 'dark' : 'outline-dark'}
          disabled={disabled}
          onClick={console.log}
        >
          <Icon I={FaCircle} className={option.selected ? '' : 'invisible'} />
        </Button>
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

const EditAns: React.FC<{
  options: DraggableMCOption[];
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
        identifier={`MC-${bodyItemId}`}
        onRearrange={console.log}
      >
        {(option, handleRef) => (
          <OneOption
            option={option}
            disabled={disabled}
            handleRef={handleRef}
          />
        )}
      </RearrangeableList>
    </>
  );
};

interface MultipleChoiceProps {
  info: MultipleChoiceInfo;
  id: string;
  disabled?: boolean;
  answer: MultipleChoiceState;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = (props) => {
  const {
    info,
    id,
    disabled = false,
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
        disabled={disabled}
        onChange={console.log}
      />
      <Form.Group as={Row}>
        <Form.Label column sm={2}>Answers</Form.Label>
        <Col sm={10}>
          <Row className="p-2 align-items-baseline">
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
            disabled={disabled}
            bodyItemId={id}
            options={zipped}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default MultipleChoice;
