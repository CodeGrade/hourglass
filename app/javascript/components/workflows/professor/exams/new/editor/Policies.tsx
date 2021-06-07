import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Policy } from '@student/exams/show/types';
import Select from 'react-select';
import { SelectOption, SelectOptions } from '@hourglass/common/helpers';

export interface PoliciesProps {
  value: readonly Policy[];
  disabled?: boolean;
  onChange: (newPolicies: Policy[]) => void;
}

export const policyToString: Record<Policy, string> = {
  IGNORE_LOCKDOWN: 'Ignore lockdown',
  TOLERATE_WINDOWED: 'Tolerate windowed mode',
  MOCK_LOCKDOWN: 'Warn upon lockdown violation',
};

const allPolicies: Policy[] = Object.keys(policyToString) as Policy[];

type PolicyOption = SelectOption<Policy>;
type PolicyOptions = SelectOptions<Policy>;

const policyValues: PolicyOptions = allPolicies.map((policy) => ({
  value: policy,
  label: policyToString[policy],
}));

const Policies: React.FC<PoliciesProps> = (props) => {
  const {
    value,
    disabled = false,
    onChange,
  } = props;
  const curPolicyValues = value.map((p) => policyValues.find((pv) => pv.value === p));
  return (
    <Form.Group as={Row} controlId="examPolicies">
      <Form.Label column sm="3">Policies:</Form.Label>
      <Col>
        <Select
          className="basic-multi-select z-1000"
          isMulti
          isDisabled={disabled}
          placeholder="Choose security policies..."
          options={policyValues}
          value={curPolicyValues}
          onChange={(options: PolicyOption[]): void => (
            onChange((options ?? []).map((o) => o.value))
          )}
        />
      </Col>
    </Form.Group>
  );
};

export default Policies;
