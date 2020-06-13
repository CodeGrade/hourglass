import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Policy } from '@student/exams/show/types';
import Select from 'react-select';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';

export interface PoliciesProps {
  policies: Policy[];
  onChange: (newPolicies: Policy[]) => void;
}

const policyToString = (p: Policy): string => {
  switch (p) {
    case Policy.ignoreLockdown: return 'Ignore lockdown';
    case Policy.tolerateWindowed: return 'Tolerate windowed mode';
    default: throw new ExhaustiveSwitchError(p);
  }
};
interface PolicyOption {
  value: Policy;
  label: string;
}
const policyValues: PolicyOption[] = Object.keys(Policy).map((policy) => ({
  value: Policy[policy],
  label: policyToString(Policy[policy]),
}));

const Policies: React.FC<PoliciesProps> = (props) => {
  const {
    policies,
    onChange,
  } = props;
  const curPolicyValues = policies.map((p) => policyValues.find((pv) => pv.value === p));
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
