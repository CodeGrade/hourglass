import React, { useContext } from 'react';
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
  Select, FormControl, InputLabel, MenuItem,
} from '@material-ui/core';
import { HTMLVal, MatchingInfo, MatchingState } from '@student/exams/show/types';
import { alphabetIdx, MutationReturn } from '@hourglass/common/helpers';
import { AlertContext } from '@hourglass/common/alerts';
import { RearrangeableList } from '@hourglass/common/rearrangeable';
import Prompted from '@professor/exams/new/editor/body-items/Prompted';
import { DragHandle, DestroyButton, EditHTMLVal } from '@professor/exams/new/editor/components/helpers';
import './Matching.css';
import { MatchingCreateMutation } from './__generated__/MatchingCreateMutation.graphql';

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
}> = (props) => {
  const {
    option,
    disabled = false,
    numChoices,
    handleRef,
  } = props;
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
          onChange={console.log}
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
            value={option.answer || -1}
            onChange={console.log}
            label="Match"
            className="w-100"
          >
            <MenuItem value={-1}>
              <em>None</em>
            </MenuItem>
            {(new Array(numChoices).fill(0).map((_v, j) => (
              <MenuItem
                // eslint-disable-next-line react/no-array-index-key
                key={j}
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
          onClick={console.log}
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
}> = (props) => {
  const {
    prompts,
    numChoices,
    bodyItemId,
    disabled = false,
  } = props;
  return (
    <>
      <RearrangeableList
        dbArray={prompts}
        disabled={disabled}
        dropVariant="info"
        identifier={`MP-${bodyItemId}`}
        onRearrange={console.log}
      >
        {(prompt, handleRef) => (
          <OnePrompt
            disabled={disabled}
            option={prompt}
            numChoices={numChoices}
            handleRef={handleRef}
          />
        )}
      </RearrangeableList>
      <Row className="p-2">
        <Col className="text-center p-0">
          <Button
            disabled={disabled}
            variant="dark"
            onClick={console.log}
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
}> = (props) => {
  const {
    value,
    disabled = false,
    handleRef,
  } = props;
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
          onChange={console.log}
          placeholder="Enter a new choice"
          debounceDelay={1000}
        />
      </Col>
      <Col className="px-0" sm="auto">
        <DestroyButton
          disabled={disabled}
          className=""
          onClick={console.log}
        />
      </Col>
    </Row>
  );
};

const EditValues: React.FC<{
  values: DraggableMValue[];
  disabled?: boolean;
  bodyItemId: string;
}> = (props) => {
  const {
    values,
    disabled = false,
    bodyItemId,
  } = props;
  return (
    <>
      <RearrangeableList
        dbArray={values}
        disabled={disabled}
        dropVariant="info"
        identifier={`MV-${bodyItemId}`}
        onRearrange={console.log}
      >
        {(value, handleRef) => (
          <OneValue
            disabled={disabled}
            value={value}
            handleRef={handleRef}
          />
        )}
      </RearrangeableList>
      <Row className="p-2">
        <Col className="text-center p-0">
          <Button
            disabled={disabled}
            variant="dark"
            onClick={console.log}
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
  answer: MatchingState;
}> = (props) => {
  const {
    info,
    id,
    disabled = false,
    answer,
  } = props;
  const zippedPrompts: DraggableMPrompt[] = info.prompts.map((prompt, index) => ({
    prompt,
    index,
    id: index.toString(),
    answer: answer[index],
  }));
  const zippedValues: DraggableMValue[] = info.values.map((value, index) => ({
    value,
    index,
    id: index.toString(),
  }));
  return (
    <>
      <Prompted
        value={info.prompt}
        disabled={disabled}
        onChange={console.log}
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
                onChange={console.log}
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
                onChange={console.log}
                debounceDelay={1000}
                placeholder="Column B"
              />
            </Col>
          </Row>
          <EditValues
            disabled={disabled}
            values={zippedValues}
            bodyItemId={id}
          />
        </Col>
      </Row>
    </>
  );
};

export default Matching;
