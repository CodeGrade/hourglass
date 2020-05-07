import React from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { YesNoInfo } from '@hourglass/types';

export interface YesNoProps {
  info: YesNoInfo;
  value: boolean;
  onChange: (newValue: boolean) => void;
  disabled: boolean;
}

const YesNo: React.FC<YesNoProps> = (props) => {
  const {
    info,
    value,
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
      <div>{prompt}</div>
      <ToggleButtonGroup
        name="tbg"
        type="radio"
        value={value}
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
