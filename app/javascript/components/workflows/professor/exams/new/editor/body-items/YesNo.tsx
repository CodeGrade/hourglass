import React, { useContext } from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import {
  graphql,
  useMutation,
} from 'relay-hooks';
import { YesNoInfo, YesNoState } from '@student/exams/show/types';
import { MutationReturn } from '@hourglass/common/helpers';
import { AlertContext } from '@hourglass/common/alerts';
import Prompted from '@professor/exams/new/editor/body-items/Prompted';
import { YesNoCreateMutation } from './__generated__/YesNoCreateMutation.graphql';

export function useCreateYesNoMutation(): MutationReturn<YesNoCreateMutation> {
  const { alert } = useContext(AlertContext);
  return useMutation<YesNoCreateMutation>(
    graphql`
    mutation YesNoCreateMutation($input: CreateYesNoInput!) {
      createYesNo(input: $input) {
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
          title: 'Error creating new Yes/No body item',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
}

const EditLabels: React.FC<{
  value: 'yn' | 'tf',
  disabled?: boolean;
  onChange: (label: 'yn' | 'tf') => void,
}> = (props) => {
  const {
    value,
    disabled = false,
    onChange,
  } = props;
  const isYesNo = (value === 'yn');
  return (
    <>
      <Form.Label column sm={2}>Answer format</Form.Label>
      <Col sm={10}>
        <ToggleButtonGroup
          className="bg-white rounded"
          name="wording"
          type="radio"
          value={value}
          onChange={onChange}
        >
          <ToggleButton
            disabled={disabled}
            variant={isYesNo ? 'primary' : 'outline-primary'}
            value="yn"
          >
            Yes/No
          </ToggleButton>
          <ToggleButton
            disabled={disabled}
            variant={(isYesNo === false) ? 'primary' : 'outline-primary'}
            value="tf"
          >
            True/False
          </ToggleButton>
        </ToggleButtonGroup>
      </Col>
    </>
  );
};

const EditAnswer: React.FC<{
  answer?: YesNoState,
  yesLabel: string,
  noLabel: string,
  disabled?: boolean;
  onChange: (answer: YesNoState) => void,
}> = (props) => {
  const {
    answer,
    yesLabel,
    noLabel,
    disabled = false,
    onChange,
  } = props;
  let tbgVal;
  if (answer === true) {
    tbgVal = 'yes';
  } else if (answer === false) {
    tbgVal = 'no';
  }
  return (
    <>
      <Form.Label column sm={2}>Correct answer</Form.Label>
      <Col sm={10}>
        <ToggleButtonGroup
          className="bg-white rounded"
          name="tbg"
          type="radio"
          value={tbgVal}
          onChange={(newVal: 'yes' | 'no') => onChange(newVal === 'yes')}
        >
          <ToggleButton
            disabled={disabled}
            variant={answer ? 'primary' : 'outline-primary'}
            value="yes"
          >
            {yesLabel}
          </ToggleButton>
          <ToggleButton
            disabled={disabled}
            variant={(answer === false) ? 'primary' : 'outline-primary'}
            value="no"
          >
            {noLabel}
          </ToggleButton>
        </ToggleButtonGroup>
      </Col>
    </>
  );
};

const YesNo: React.FC<{
  info: YesNoInfo,
  id: string,
  disabled?: boolean;
  answer: YesNoState,
}> = (props) => {
  const {
    info,
    answer,
    disabled = false,
  } = props;
  return (
    <>
      <Prompted
        value={info.prompt}
        disabled={disabled}
        onChange={console.log}
      />
      <Form.Group as={Row}>
        <EditLabels
          value={info.yesLabel === 'Yes' ? 'yn' : 'tf'}
          disabled={disabled}
          onChange={console.log}
        />
        {/* <Fields names={['yesLabel', 'noLabel']} component={EditLabels} /> */}
      </Form.Group>
      <Form.Group as={Row}>
        <EditAnswer
          disabled={disabled}
          answer={answer}
          yesLabel={info.yesLabel}
          noLabel={info.noLabel}
          onChange={console.log}
        />
        {/* <Fields names={['yesLabel', 'noLabel', 'answer']} component={EditAnswer} /> */}
      </Form.Group>
    </>
  );
};

export default YesNo;
