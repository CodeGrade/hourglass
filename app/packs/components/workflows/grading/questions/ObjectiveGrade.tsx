import React, { useState } from 'react';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
import './ObjectiveGrade.scss';
import { NumericInput } from '@hourglass/common/NumericInput';

interface ObjectiveGradeProps {
  className?: string;
}
const ObjectiveGrade: React.FC<ObjectiveGradeProps> = (props) => {
  const { className } = props;
  const [value, setValue] = useState<boolean>(undefined);
  return (
    <ToggleButtonGroup
      name="correctness"
      type="radio"
      className={className}
      value={value ? 'right' : 'wrong'}
    >
      <ToggleButton
        className="d-inline-flex align-items-center"
        size="sm"
        value="right"
        variant={value === true ? 'success' : 'outline-success'}
        onChange={() => setValue(true)}
      >
        <Icon I={FaCheck} className="mr-2" />
        Correct
      </ToggleButton>
      <ToggleButton
        className="d-inline-flex align-items-center"
        size="sm"
        value="wrong"
        variant={value === false ? 'danger' : 'outline-danger'}
        onChange={() => setValue(false)}
      >
        <Icon I={FaTimes} className="mr-2" />
        <span className="mr-2">Wrong:</span>
        <NumericInput
          className="w-100px"
          size="sm"
          step={0.5}
          min={0}
          disabled={value !== false}
        />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ObjectiveGrade;
