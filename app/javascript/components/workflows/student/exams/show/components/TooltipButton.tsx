import React from 'react';
import {
  Button, ButtonProps, OverlayTriggerProps,
} from 'react-bootstrap';
import Tooltip from '@student/exams/show/components/Tooltip';
import './TooltipButton.css';

interface TooltipButtonProps {
  disabled: boolean;
  disabledMessage: string;
  placement?: OverlayTriggerProps['placement'];
  onClick?: () => void;
  variant?: ButtonProps['variant'];
}

const TooltipButton: React.FC<TooltipButtonProps> = (props) => {
  const {
    disabled,
    disabledMessage,
    onClick,
    variant = 'primary',
    placement = 'bottom',
    children,
  } = props;
  return (
    <Tooltip
      showTooltip={disabled}
      message={disabledMessage}
      placement={placement}
    >
      <span
        className={`d-inline-block ${disabled && 'cursor-help'}`}
      >
        <Button
          variant={variant}
          onClick={onClick}
          disabled={disabled}
          className={disabled && 'pointer-events-none'}
        >
          {children}
        </Button>
      </span>
    </Tooltip>
  );
};

export default TooltipButton;
