import React from 'react';
import {
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import {
  Select, FormControl, InputLabel, MenuItem,
} from '@material-ui/core';
import Prompted from '@hourglass/workflows/professor/exams/new/editor/body-items/Prompted';
import { alphabetIdx } from '@hourglass/common/helpers';
import './Matching.css';
import { HTMLVal, MatchingInfo, MatchingState } from '@hourglass/workflows/student/exams/show/types';
import RearrangableList from '@hourglass/common/rearrangeable';
import { EditHTMLVal, DestroyButton, DragHandle } from '..';

type DraggableMPrompt = {
  id: string;
  index: number;
  prompt: HTMLVal;
  answer?: number;
}

const OnePrompt: React.FC<{
  option: DraggableMPrompt,
  numChoices: number,
  handleRef: React.Ref<HTMLElement>,
}> = (props) => {
  const {
    option,
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
          // disabled={loading || disabled}
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
  bodyItemId: string;
}> = (props) => {
  const {
    prompts,
    numChoices,
    bodyItemId,
  } = props;
  return (
    <>
      <RearrangableList
        dbArray={prompts}
        identifier={`MP-${bodyItemId}`}
        onRearrange={console.log}
      >
        {(prompt, handleRef) => (
          <OnePrompt
            option={prompt}
            numChoices={numChoices}
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
  handleRef: React.Ref<HTMLElement>;
}> = (props) => {
  const {
    value,
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
          // disabled={loading || disabled}
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
          className=""
          onClick={console.log}
        />
      </Col>
    </Row>
  );
};

const EditValues: React.FC<{
  values: DraggableMValue[];
  bodyItemId: string;
}> = (props) => {
  const {
    values,
    bodyItemId,
  } = props;
  return (
    <>
      <RearrangableList
        dbArray={values}
        identifier={`MV-${bodyItemId}`}
        onRearrange={console.log}
      >
        {(value, handleRef) => (
          <OneValue
            value={value}
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
  answer: MatchingState;
}> = (props) => {
  const {
    info,
    id,
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
        onChange={console.log}
      />
      <Row>
        <Col sm={6}>
          <Row className="p-2">
            <Col className="text-center p-0">
              <EditHTMLVal
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
            prompts={zippedPrompts}
            bodyItemId={id}
            numChoices={info.values.length}
          />
          {/* <RenderPrompts
            prompts={info.prompts}
          /> */}
          {/* <Field name="values" component={RenderPrompts} /> */}
        </Col>
        <Col sm={6}>
          <Row className="p-2">
            <Col className="text-center p-0">
              <EditHTMLVal
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
            values={zippedValues}
            bodyItemId={id}
          />
          {/* <Field name="prompts" component={RenderValues} /> */}
        </Col>
      </Row>
    </>
  );
};

export default Matching;
