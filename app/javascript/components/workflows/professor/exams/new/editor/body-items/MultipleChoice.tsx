import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
import {
  arrSplice,
  IdArray,
  idForIndex,
  RearrangeableList,
  RearrangeableListProps,
} from '@hourglass/common/rearrangeable';
import { MutationReturn } from '@hourglass/common/helpers';
import { AlertContext } from '@hourglass/common/alerts';
import Prompted from '@professor/exams/new/editor/body-items/Prompted';
import { DragHandle, DestroyButton, EditHTMLVal } from '@professor/exams/new/editor/components/helpers';

import { MultipleChoiceCreateMutation } from './__generated__/MultipleChoiceCreateMutation.graphql';
import { MultipleChoiceChangeMutation } from './__generated__/MultipleChoiceChangeMutation.graphql';

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

function useChangeMultipleChoiceMutation(): MutationReturn<MultipleChoiceChangeMutation> {
  const { alert } = useContext(AlertContext);
  return useMutation<MultipleChoiceChangeMutation>(
    graphql`
    mutation MultipleChoiceChangeMutation($input: ChangeMultipleChoiceDetailsInput!) {
      changeMultipleChoiceDetails(input: $input) {
        bodyItem {
          id
          info
          answer
        }
      }
    }
    `,
    {
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error changing MultipleChoice body item',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
}

interface DraggableMCOption {
  id: string;
  index: number;
  option: HTMLVal;
  selected: boolean;
}

const OneOption: React.FC<{
  option: DraggableMCOption;
  disabled?: boolean;
  handleRef: React.Ref<HTMLElement>;
  setAnswer: (index: number) => void;
  setPrompt: (index: number, prompt: HTMLVal) => void;
  deleteItem: (index: number) => void;
}> = (props) => {
  const {
    option,
    disabled: parentDisabled = false,
    handleRef,
    setAnswer,
    setPrompt,
    deleteItem,
  } = props;
  const disabled = parentDisabled;
  const onChange = useCallback((newVal: HTMLVal) => setPrompt(option.index, newVal), [setPrompt]);
  const onClick = useCallback(() => setAnswer(option.index), [option.index]);
  return (
    <Row className="p-2 align-items-center">
      <Col sm="auto" className="p-0">
        {handleRef && <DragHandle handleRef={handleRef} variant="info" alignmentClass="m-0" />}
      </Col>
      <Col className="flex-grow-01">
        <Button
          variant={option.selected ? 'dark' : 'outline-dark'}
          disabled={disabled}
          onClick={onClick}
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
          onChange={onChange}
          debounceDelay={1000}
        />
      </Col>
      <Col className="px-0" sm="auto">
        <DestroyButton
          className=""
          disabled={disabled}
          onClick={() => deleteItem(option.index)}
        />
      </Col>
    </Row>
  );
};

const EditAns: React.FC<{
  options: DraggableMCOption[];
  disabled?: boolean;
  bodyItemId: string;
  onRearrange: RearrangeableListProps<DraggableMCOption>['onRearrange'];
  setAnswer: (index: number) => void;
  setOption: (index: number, prompt: HTMLVal) => void;
  deleteOption: (index: number) => void;
}> = (props) => {
  const {
    options,
    disabled = false,
    bodyItemId,
    onRearrange,
    setAnswer,
    setOption,
    deleteOption,
  } = props;
  return (
    <>
      <RearrangeableList
        dbArray={options}
        disabled={disabled}
        dropVariant="info"
        identifier={`MC-${bodyItemId}`}
        onRearrange={onRearrange}
      >
        {(option, handleRef) => (
          <OneOption
            option={option}
            disabled={disabled}
            handleRef={handleRef}
            setAnswer={setAnswer}
            setPrompt={setOption}
            deleteItem={deleteOption}
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
    disabled: parentDisabled = false,
    answer,
  } = props;
  // deliberately going to mutate a stateful array, rather
  // than use the setter for this, since we're trying to maintain
  // a persistent mapping of items to "stable" (but not database-backed) ids.
  const [itemsToIds] = useState<IdArray>({
    base: id,
    current: 0,
    ids: [],
  });
  const [curAnswer, setCurAnswer] = useState(answer);
  useEffect(() => setCurAnswer(answer), [answer]);
  const [mutate, { loading }] = useChangeMultipleChoiceMutation();
  const updatePrompt = useCallback((newPrompt: HTMLVal) => {
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updatePrompt: true,
          prompt: newPrompt,
        },
      },
    });
  }, [id]);

  const rearrangeOptions = useCallback((from: number, to: number) => {
    const newOptions = arrSplice(info.options, from, to);
    itemsToIds.ids = arrSplice(itemsToIds.ids, from, to);
    let newAnswer = curAnswer;
    if (from === curAnswer) {
      newAnswer = to;
    } else if (from < curAnswer && to >= curAnswer) {
      newAnswer -= 1;
    } else if (from > curAnswer && to <= curAnswer) {
      newAnswer += 1;
    }
    setCurAnswer(newAnswer);
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateOptions: true,
          options: newOptions,
          updateAnswer: newAnswer !== curAnswer,
          answer: newAnswer,
        },
      },
    });
  }, [id, curAnswer, info.options]);
  const updateOption = useCallback((index: number, prompt: HTMLVal) => {
    const newOptions = [...info.options];
    newOptions[index] = prompt;
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateOptions: true,
          options: newOptions,
        },
      },
    });
  }, [id, info.options]);
  const deleteOption = useCallback((index: number) => {
    const newOptions = [...info.options];
    newOptions.splice(index, 1);
    itemsToIds.ids.splice(index, 1);
    let newAnswer = curAnswer;
    if (curAnswer === index) {
      newAnswer = undefined;
    } else if (curAnswer > index) {
      newAnswer -= 1;
    }
    setCurAnswer(newAnswer);
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateOptions: true,
          options: newOptions,
          updateAnswer: curAnswer !== newAnswer,
          answer: newAnswer,
        },
      },
    });
  }, [id, answer, info.options]);
  const addOption = useCallback(() => {
    const newOptions: HTMLVal[] = [
      ...info.options,
      { type: 'HTML', value: '' },
    ];
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateOptions: true,
          options: newOptions,
        },
      },
    });
  }, [id, info.options]);
  const updateAnswer = useCallback((newAnswer: MultipleChoiceState) => {
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateAnswer: true,
          answer: newAnswer,
        },
      },
    });
  }, [id]);
  const disabled = parentDisabled || loading;
  const zipped: DraggableMCOption[] = useMemo(() => (
    info.options.map((option, index) => ({
      option,
      id: idForIndex(itemsToIds, index),
      index,
      selected: index === curAnswer,
    }))
  ), [info.options, curAnswer]);
  return (
    <>
      <Prompted
        value={info.prompt}
        disabled={disabled}
        onChange={updatePrompt}
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
            setAnswer={updateAnswer}
            onRearrange={rearrangeOptions}
            setOption={updateOption}
            deleteOption={deleteOption}
          />
          <Row className="p-2">
            <Col className="text-center p-0">
              <Button
                disabled={disabled}
                variant="dark"
                onClick={addOption}
              >
                Add new option
              </Button>
            </Col>
          </Row>
        </Col>
      </Form.Group>
    </>
  );
};

export default MultipleChoice;
