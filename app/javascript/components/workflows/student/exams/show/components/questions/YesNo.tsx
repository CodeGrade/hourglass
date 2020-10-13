import React from 'react';
import { ButtonProps, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { YesNoInfo } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';

export interface YesNoProps {
  info: YesNoInfo;
  value: boolean;
  className?: string;
  onChange: (newValue: boolean) => void;
  disabled?: boolean;
  variant?: ButtonProps['variant'];
}

const YesNo: React.FC<YesNoProps> = (props) => {
  const {
    info,
    value,
    className,
    onChange,
    disabled,
    variant = 'primary',
  } = props;
  const {
    prompt,
    yesLabel = 'Yes',
    noLabel = 'No',
  } = info;
  return (
    <div>
      <HTML value={prompt} />
      <ToggleButtonGroup
        name="tbg"
        type="radio"
        value={value}
        className={className}
        onChange={onChange}
      >
        <ToggleButton
          disabled={disabled}
          variant={value ? variant : `outline-${variant}`}
          value
        >
          {yesLabel}
        </ToggleButton>
        <ToggleButton
          disabled={disabled}
          variant={(value === false) ? variant : `outline-${variant}`}
          value={false}
        >
          {noLabel}
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

export default YesNo;
