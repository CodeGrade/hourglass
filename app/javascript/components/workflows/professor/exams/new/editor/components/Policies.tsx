import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Policy } from '@student/exams/show/types';
import Select from 'react-select';
import { ExhaustiveSwitchError, SelectOption, SelectOptions } from '@hourglass/common/helpers';

export interface PoliciesProps {
  value: Policy[];
  onChange: (newPolicies: Policy[]) => void;
}

export const policyToString = (p: Policy): string => {
  switch (p) {
    case Policy.ignoreLockdown: return 'Ignore lockdown';
    case Policy.tolerateWindowed: return 'Tolerate windowed mode';
    case Policy.mockLockdown: return 'Warn upon lockdown violation';
    default: throw new ExhaustiveSwitchError(p);
  }
};
type PolicyOption = SelectOption<Policy>;
type PolicyOptions = SelectOptions<Policy>;

const policyValues: PolicyOptions = Object.keys(Policy).map((policy) => ({
  value: Policy[policy],
  label: policyToString(Policy[policy]),
}));

const Policies: React.FC<PoliciesProps> = (props) => {
  const {
    value,
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
