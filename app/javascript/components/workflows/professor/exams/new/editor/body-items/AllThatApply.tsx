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
import { FaCheck } from 'react-icons/fa';
import { GrDrag } from 'react-icons/gr';
import Icon from '@student/exams/show/components/Icon';
import { AllThatApplyInfo, AllThatApplyState, HTMLVal } from '@student/exams/show/types';
import { MutationReturn } from '@hourglass/common/helpers';
import { AlertContext } from '@hourglass/common/alerts';
import {
  arrSplice,
  IdArray,
  idForIndex,
  RearrangeableList,
  RearrangeableListProps,
} from '@hourglass/common/rearrangeable';
import { DragHandle, DestroyButton, EditHTMLVal } from '@professor/exams/new/editor/components/helpers';
import Prompted from './Prompted';

import { AllThatApplyCreateMutation } from './__generated__/AllThatApplyCreateMutation.graphql';
import { AllThatApplyChangeMutation } from './__generated__/AllThatApplyChangeMutation.graphql';

export function useCreateAllThatApplyMutation(): MutationReturn<AllThatApplyCreateMutation> {
  const { alert } = useContext(AlertContext);
  return useMutation<AllThatApplyCreateMutation>(
    graphql`
    mutation AllThatApplyCreateMutation($input: CreateAllThatApplyInput!) {
      createAllThatApply(input: $input) {
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
          title: 'Error creating new AllThatApply body item',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
}

function useChangeAllThatApplyMutation(): MutationReturn<AllThatApplyChangeMutation> {
  const { alert } = useContext(AlertContext);
  return useMutation<AllThatApplyChangeMutation>(
    graphql`
    mutation AllThatApplyChangeMutation($input: ChangeAllThatApplyDetailsInput!) {
      changeAllThatApplyDetails(input: $input) {
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
          title: 'Error changing AllThatApply body item',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
}

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
  index: number;
  option: HTMLVal;
  answer: boolean;
}

const OneOption: React.FC<{
  option: DraggableATAOption;
  disabled?: boolean;
  handleRef: React.Ref<HTMLElement>;
  setAnswer: (index: number, selected: boolean) => void;
  setPrompt: (index: number, prompt: HTMLVal) => void;
  deleteOption: (index: number) => void;
}> = (props) => {
  const {
    option,
    disabled: parentDisabled = false,
    handleRef,
    setAnswer,
    setPrompt,
    deleteOption,
  } = props;
  const disabled = parentDisabled;
  const onSelect = useCallback(
    (selected) => setAnswer(option.index, selected),
    [setAnswer, option.index],
  );
  const onChange = useCallback((newVal: HTMLVal) => setPrompt(option.index, newVal), [setPrompt]);
  return (
    <Row className="p-2 align-items-center">
      <Col sm="auto" className="p-0">
        {handleRef && <DragHandle handleRef={handleRef} variant="info" alignmentClass="" />}
      </Col>
      <Col className="flex-grow-01">
        <EditAnswer
          value={option.answer}
          disabled={disabled}
          onChange={onSelect}
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
          onChange={onChange}
          debounceDelay={1000}
        />
      </Col>
      <Col className="px-0" sm="auto">
        <DestroyButton
          className=""
          disabled={disabled}
          onClick={() => deleteOption(option.index)}
        />
      </Col>
    </Row>
  );
};

const EditOptions: React.FC<{
  options: DraggableATAOption[];
  disabled?: boolean;
  bodyItemId: string;
  onRearrange: RearrangeableListProps<DraggableATAOption>['onRearrange'];
  setAnswer: (index: number, selected: boolean) => void;
  setPrompt: (index: number, prompt: HTMLVal) => void;
  deleteOption: (index: number) => void;
  addOption: () => void;
}> = (props) => {
  const {
    options,
    disabled = false,
    bodyItemId,
    onRearrange,
    setAnswer,
    setPrompt,
    deleteOption,
    addOption,
  } = props;
  return (
    <>
      <RearrangeableList
        dbArray={options}
        disabled={disabled}
        dropVariant="info"
        identifier={`ATA-${bodyItemId}`}
        onRearrange={onRearrange}
      >
        {(option, handleRef) => (
          <OneOption
            disabled={disabled}
            option={option}
            handleRef={handleRef}
            setAnswer={setAnswer}
            setPrompt={setPrompt}
            deleteOption={deleteOption}
          />
        )}
      </RearrangeableList>
      <Row className="p-2">
        <Col className="text-center p-0">
          <Button
            variant="dark"
            disabled={disabled}
            onClick={addOption}
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
  const [mutate, { loading }] = useChangeAllThatApplyMutation();
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
    const newAnswer = arrSplice(curAnswer, from, to);
    setCurAnswer(newAnswer);
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateOptions: true,
          options: newOptions,
          updateAnswer: true,
          answer: newAnswer,
        },
      },
    });
  }, [id, curAnswer, info.options]);
  const updateOptionPrompt = useCallback((index: number, prompt: HTMLVal) => {
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
    const newAnswer = [...curAnswer];
    newAnswer.splice(index, 1);
    setCurAnswer(newAnswer);
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateOptions: true,
          options: newOptions,
          updateAnswer: true,
          answer: newAnswer,
        },
      },
    });
  }, [id, curAnswer, info.options]);
  const addOption = useCallback(() => {
    const newOptions: HTMLVal[] = [
      ...info.options,
      { type: 'HTML', value: '' },
    ];
    const newAnswer = [...curAnswer, false];
    setCurAnswer(newAnswer);
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateOptions: true,
          options: newOptions,
          updateAnswer: true,
          answer: newAnswer,
        },
      },
    });
  }, [id, info.options, curAnswer]);
  const updateAnswer = useCallback((index: number, selected: boolean) => {
    const newAnswer = [...curAnswer];
    newAnswer[index] = selected;
    setCurAnswer(newAnswer);
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateAnswer: true,
          answer: newAnswer,
        },
      },
    });
  }, [id, curAnswer]);
  const disabled = parentDisabled || loading;
  const zipped: DraggableATAOption[] = useMemo(() => (
    info.options.map((option, index) => ({
      option,
      id: idForIndex(itemsToIds, index),
      index,
      answer: curAnswer[index],
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
            onRearrange={rearrangeOptions}
            addOption={addOption}
            deleteOption={deleteOption}
            setAnswer={updateAnswer}
            setPrompt={updateOptionPrompt}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default AllThatApply;
