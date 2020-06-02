import React from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { YesNoInfo } from '@student/exams/show/types';
import HTML from '../HTML';

export interface YesNoProps {
  info: YesNoInfo;
  value: boolean;
  className?: string;
  onChange: (newValue: boolean) => void;
  disabled?: boolean;
}

const YesNo: React.FC<YesNoProps> = (props) => {
  const {
    info,
    value,
    className,
    onChange,
    disabled,
  } = props;
  const {
    prompt,
    yesLabel = 'Yes',
    noLabel = 'No',
  } = info;
  return (
    <div>
      <div><HTML value={prompt} /></div>
      <ToggleButtonGroup
        name="tbg"
        type="radio"
        value={value}
        className={className}
        onChange={onChange}
      >
        <ToggleButton
          disabled={disabled}
          variant={value ? 'primary' : 'outline-primary'}
          value
        >
          {yesLabel}
        </ToggleButton>
        <ToggleButton
          disabled={disabled}
          variant={(value === false) ? 'primary' : 'outline-primary'}
          value={false}
        >
          {noLabel}
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

export default YesNo;
