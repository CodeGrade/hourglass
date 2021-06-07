import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import {
  graphql,
  useMutation,
} from 'relay-hooks';
import {
  Select,
  SelectProps,
  FormControl,
  InputLabel,
  MenuItem,
} from '@material-ui/core';
import { HTMLVal, MatchingInfo } from '@student/exams/show/types';
import { alphabetIdx, MutationReturn } from '@hourglass/common/helpers';
import { AlertContext } from '@hourglass/common/alerts';
import {
  arrSplice,
  IdArray,
  idForIndex,
  RearrangeableList,
  RearrangeableListProps,
} from '@hourglass/common/rearrangeable';
import Prompted from '@professor/exams/new/editor/body-items/Prompted';
import { DragHandle, DestroyButton, EditHTMLVal } from '@professor/exams/new/editor/components/helpers';
import './Matching.css';
import { MatchingCreateMutation } from './__generated__/MatchingCreateMutation.graphql';
import { MatchingChangeMutation } from './__generated__/MatchingChangeMutation.graphql';

export function useCreateMatchingMutation(): MutationReturn<MatchingCreateMutation> {
  const { alert } = useContext(AlertContext);
  return useMutation<MatchingCreateMutation>(
    graphql`
    mutation MatchingCreateMutation($input: CreateMatchingInput!) {
      createMatching(input: $input) {
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
          title: 'Error creating new Matching body item',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
}

function useChangeMatchingMutation(): MutationReturn<MatchingChangeMutation> {
  const { alert } = useContext(AlertContext);
  return useMutation<MatchingChangeMutation>(
    graphql`
    mutation MatchingChangeMutation($input: ChangeMatchingDetailsInput!) {
      changeMatchingDetails(input: $input) {
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
          title: 'Error changing Matching body item',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
}

type DraggableMPrompt = {
  id: string;
  index: number;
  prompt: HTMLVal;
  answer?: number;
}

const OnePrompt: React.FC<{
  option: DraggableMPrompt,
  disabled?: boolean;
  numChoices: number,
  handleRef: React.Ref<HTMLElement>,
  setAnswer: (index: number, answer: number) => void;
  setPrompt: (index: number, prompt: HTMLVal) => void;
  deleteItem: (index: number) => void;
}> = (props) => {
  const {
    option,
    disabled = false,
    numChoices,
    handleRef,
    setAnswer,
    setPrompt,
    deleteItem,
  } = props;
  const onPrompt = useCallback((newVal: HTMLVal) => setPrompt(option.index, newVal), [setPrompt]);
  const onChoose: SelectProps['onChange'] = (e) => {
    setAnswer(option.index, e.target.value as number);
  };
  return (
    <Row className="p-2 align-items-center">
      <Col sm="auto" className="p-0">
        {handleRef && <DragHandle handleRef={handleRef} variant="info" alignmentClass="" />}
      </Col>
      <Col sm="auto" className="pr-0">
        {`${alphabetIdx(option.index)}.`}
      </Col>
      <Col sm>
        <EditHTMLVal
          className="bg-white border rounded"
          disabled={disabled}
          value={option.prompt || {
            type: 'HTML',
            value: '',
          }}
          onChange={onPrompt}
          placeholder="Enter a new prompt"
          debounceDelay={1000}
        />
      </Col>
      <Col sm="3" className="pl-0">
        <FormControl variant="outlined" className="w-100">
          <InputLabel>Match</InputLabel>
          <Select
            disabled={disabled}
            margin="dense"
            value={option.answer ?? -1}
            onChange={onChoose}
            label="Match"
            className="w-100"
          >
            <MenuItem value={-1}>
              <em>None</em>
            </MenuItem>
            {(new Array(numChoices).fill(0).map((_v, j) => (
              <MenuItem
                // eslint-disable-next-line react/no-array-index-key
                key={`${option.id}_${j}`}
                value={j}
              >
                {j + 1}
              </MenuItem>
            )))}
          </Select>
        </FormControl>
      </Col>
      <Col className="px-0" sm="auto">
        <DestroyButton
          disabled={disabled}
          className=""
          onClick={() => deleteItem(option.index)}
        />
      </Col>
    </Row>
  );
};

const EditPrompts: React.FC<{
  prompts: DraggableMPrompt[];
  numChoices: number;
  disabled?: boolean;
  bodyItemId: string;
  onRearrange: RearrangeableListProps<DraggableMPrompt>['onRearrange'];
  setAnswer: (index: number, answer: number) => void;
  setPrompt: (index: number, prompt: HTMLVal) => void;
  deletePrompt: (index: number) => void;
  addPrompt: () => void;
}> = (props) => {
  const {
    prompts,
    numChoices,
    bodyItemId,
    disabled = false,
    onRearrange,
    setAnswer,
    setPrompt,
    deletePrompt,
    addPrompt,
  } = props;
  return (
    <>
      <RearrangeableList
        dbArray={prompts}
        disabled={disabled}
        dropVariant="info"
        identifier={`MP-${bodyItemId}`}
        onRearrange={onRearrange}
      >
        {(prompt, handleRef) => (
          <OnePrompt
            disabled={disabled}
            option={prompt}
            numChoices={numChoices}
            handleRef={handleRef}
            setAnswer={setAnswer}
            setPrompt={setPrompt}
            deleteItem={deletePrompt}
          />
        )}
      </RearrangeableList>
      <Row className="p-2">
        <Col className="text-center p-0">
          <Button
            disabled={disabled}
            variant="dark"
            onClick={addPrompt}
          >
            Add new prompt
          </Button>
        </Col>
      </Row>
    </>
  );
};

type DraggableMValue = {
  id: string,
  index: number,
  value: HTMLVal,
}

const OneValue: React.FC<{
  value: DraggableMValue;
  disabled?: boolean;
  handleRef: React.Ref<HTMLElement>;
  setValue: (index: number, prompt: HTMLVal) => void;
  deleteValue: (index: number) => void;
}> = (props) => {
  const {
    value,
    disabled = false,
    handleRef,
    setValue,
    deleteValue,
  } = props;
  const onValue = useCallback((newVal: HTMLVal) => setValue(value.index, newVal), [setValue]);
  return (
    <Row className="p-2 align-items-center">
      <Col sm="auto" className="p-0">
        {handleRef && <DragHandle handleRef={handleRef} variant="info" alignmentClass="" />}
      </Col>
      <Col sm="auto" className="pr-0">
        {`${value.index + 1}.`}
      </Col>
      <Col sm>
        <EditHTMLVal
          className="bg-white border rounded"
          disabled={disabled}
          value={value.value || {
            type: 'HTML',
            value: '',
          }}
          onChange={onValue}
          placeholder="Enter a new choice"
          debounceDelay={1000}
        />
      </Col>
      <Col className="px-0" sm="auto">
        <DestroyButton
          disabled={disabled}
          className=""
          onClick={() => deleteValue(value.index)}
        />
      </Col>
    </Row>
  );
};

const EditValues: React.FC<{
  values: DraggableMValue[];
  disabled?: boolean;
  bodyItemId: string;
  onRearrange: RearrangeableListProps<DraggableMValue>['onRearrange'];
  setValue: (index: number, value: HTMLVal) => void;
  deleteValue: (index: number) => void;
  addValue: () => void;
}> = (props) => {
  const {
    values,
    disabled = false,
    bodyItemId,
    onRearrange,
    setValue,
    deleteValue,
    addValue,
  } = props;
  return (
    <>
      <RearrangeableList
        dbArray={values}
        disabled={disabled}
        dropVariant="info"
        identifier={`MV-${bodyItemId}`}
        onRearrange={onRearrange}
      >
        {(value, handleRef) => (
          <OneValue
            disabled={disabled}
            value={value}
            handleRef={handleRef}
            setValue={setValue}
            deleteValue={deleteValue}
          />
        )}
      </RearrangeableList>
      <Row className="p-2">
        <Col className="text-center p-0">
          <Button
            disabled={disabled}
            variant="dark"
            onClick={addValue}
          >
            Add new value
          </Button>
        </Col>
      </Row>
    </>
  );
};

const Matching: React.FC<{
  info: MatchingInfo;
  id: string;
  disabled?: boolean;
  answer: number[];
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
  const [promptsToIds] = useState<IdArray>({
    base: `${id}_prompts`,
    current: 0,
    ids: [],
  });
  const [valuesToIds] = useState<IdArray>({
    base: `${id}_values`,
    current: 0,
    ids: [],
  });
  const [curAnswer, setCurAnswer] = useState(answer);
  useEffect(() => setCurAnswer(answer), [answer]);
  const [mutate, { loading }] = useChangeMatchingMutation();
  const updateItemPrompt = useCallback((newPrompt: HTMLVal) => {
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
  const updatePromptsLabel = useCallback((newLabel: HTMLVal) => {
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updatePromptsLabel: true,
          promptsLabel: newLabel,
        },
      },
    });
  }, [id]);
  const updateValuesLabel = useCallback((newLabel: HTMLVal) => {
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateMatchValuesLabel: true,
          matchValuesLabel: newLabel,
        },
      },
    });
  }, [id]);

  // PROMPTS MANIPULATION
  const rearrangePrompts = useCallback((from: number, to: number) => {
    const newPrompts = arrSplice(info.prompts, from, to);
    promptsToIds.ids = arrSplice(promptsToIds.ids, from, to);
    const newAnswer = arrSplice(curAnswer, from, to);
    setCurAnswer(newAnswer);
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updatePrompts: true,
          prompts: newPrompts,
          updateAnswer: true,
          answer: newAnswer,
        },
      },
    });
  }, [id, curAnswer, info.prompts]);
  const updatePrompt = useCallback((index: number, prompt: HTMLVal) => {
    const newPrompts = [...info.prompts];
    newPrompts[index] = prompt;
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updatePrompts: true,
          prompts: newPrompts,
        },
      },
    });
  }, [id, info.prompts]);
  const deletePrompt = useCallback((index: number) => {
    const newPrompts = [...info.prompts];
    newPrompts.splice(index, 1);
    promptsToIds.ids.splice(index, 1);
    const newAnswer = [...curAnswer];
    newAnswer.splice(index, 1);
    setCurAnswer(newAnswer);
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updatePrompts: true,
          prompts: newPrompts,
          updateAnswer: curAnswer !== newAnswer,
          answer: newAnswer,
        },
      },
    });
  }, [id, curAnswer, info.prompts]);
  const addPrompt = useCallback(() => {
    const newPrompts: HTMLVal[] = [
      ...info.prompts,
      { type: 'HTML', value: '' },
    ];
    const newAnswer: number[] = [
      ...curAnswer,
      null,
    ];
    setCurAnswer(newAnswer);
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updatePrompts: true,
          prompts: newPrompts,
          updateAnswer: true,
          answer: newAnswer,
        },
      },
    });
  }, [id, curAnswer, info.prompts]);
  const updateAnswer = useCallback((index: number, newAns: number) => {
    const newAnswer = [...curAnswer];
    newAnswer[index] = newAns === -1 ? null : newAns;
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

  // VALUES MANIPULATION
  const rearrangeValues = useCallback((from: number, to: number) => {
    const movedValues = arrSplice([...Array(info.values.length).keys()], from, to);
    const newValues = arrSplice(info.values, from, to);
    valuesToIds.ids = arrSplice(valuesToIds.ids, from, to);
    const newAnswer = curAnswer.map((v) => movedValues[v]);
    setCurAnswer(newAnswer);
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateMatchValues: true,
          matchValues: newValues,
          updateAnswer: true,
          answer: newAnswer,
        },
      },
    });
  }, [id, curAnswer, info.values]);
  const updateValue = useCallback((index: number, prompt: HTMLVal) => {
    const newValues = [...info.values];
    newValues[index] = prompt;
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateMatchValues: true,
          matchValues: newValues,
        },
      },
    });
  }, [id, info.prompts]);
  const deleteValue = useCallback((index: number) => {
    const newValues = [...info.values];
    newValues.splice(index, 1);
    valuesToIds.ids.splice(index, 1);
    const newAnswer = curAnswer.map((v) => {
      if (v > index) {
        return v - 1;
      }
      if (v === index) {
        return -1;
      }
      return v;
    });
    setCurAnswer(newAnswer);
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateMatchValues: true,
          matchValues: newValues,
          updateAnswer: true,
          answer: newAnswer,
        },
      },
    });
  }, [id, curAnswer, info.values]);
  const addValue = useCallback(() => {
    const newValues: HTMLVal[] = [
      ...info.values,
      { type: 'HTML', value: '' },
    ];
    const newAnswer: number[] = [
      ...curAnswer,
      -1,
    ];
    setCurAnswer(newAnswer);
    mutate({
      variables: {
        input: {
          bodyItemId: id,
          updateMatchValues: true,
          matchValues: newValues,
          updateAnswer: true,
          answer: newAnswer,
        },
      },
    });
  }, [id, curAnswer, info.values]);

  const disabled = parentDisabled || loading;

  const zippedPrompts: DraggableMPrompt[] = useMemo(() => (
    info.prompts.map((prompt, index) => ({
      prompt,
      index,
      id: idForIndex(promptsToIds, index),
      answer: curAnswer[index],
    }))
  ), [info.prompts, curAnswer]);
  const zippedValues: DraggableMValue[] = useMemo(() => (
    info.values.map((value, index) => ({
      value,
      index,
      id: idForIndex(valuesToIds, index),
    }))
  ), [info.values]);
  return (
    <>
      <Prompted
        value={info.prompt}
        disabled={disabled}
        onChange={updateItemPrompt}
      />
      <Row>
        <Col sm={6}>
          <Row className="p-2">
            <Col className="text-center p-0">
              <EditHTMLVal
                disabled={disabled}
                className="bg-white rounded"
                value={info.promptsLabel || {
                  type: 'HTML',
                  value: '',
                }}
                onChange={updatePromptsLabel}
                debounceDelay={1000}
                placeholder="Column A"
              />
            </Col>
          </Row>
          <EditPrompts
            disabled={disabled}
            prompts={zippedPrompts}
            bodyItemId={id}
            numChoices={info.values.length}
            addPrompt={addPrompt}
            deletePrompt={deletePrompt}
            onRearrange={rearrangePrompts}
            setAnswer={updateAnswer}
            setPrompt={updatePrompt}
          />
        </Col>
        <Col sm={6}>
          <Row className="p-2">
            <Col className="text-center p-0">
              <EditHTMLVal
                disabled={disabled}
                className="bg-white rounded"
                value={info.valuesLabel || {
                  type: 'HTML',
                  value: '',
                }}
                onChange={updateValuesLabel}
                debounceDelay={1000}
                placeholder="Column B"
              />
            </Col>
          </Row>
          <EditValues
            disabled={disabled}
            values={zippedValues}
            bodyItemId={id}
            addValue={addValue}
            deleteValue={deleteValue}
            onRearrange={rearrangeValues}
            setValue={updateValue}
          />
        </Col>
      </Row>
    </>
  );
};

export default Matching;
