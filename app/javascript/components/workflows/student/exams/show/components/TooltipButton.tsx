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
  className?: React.HTMLAttributes<HTMLButtonElement>['className'];
  cursorClass?: 'cursor-help' | 'cursor-not-allowed';
}

const TooltipButton: React.FC<TooltipButtonProps> = (props) => {
  const {
    disabled,
    disabledMessage,
    onClick,
    variant = 'primary',
    placement = 'bottom',
    children,
    className,
    cursorClass = 'cursor-help',
  } = props;
  return (
    <Tooltip
      showTooltip={disabled}
      message={disabledMessage}
      placement={placement}
    >
      <span
        className={`d-inline-block ${disabled ? cursorClass : ''}`}
      >
        <Button
          variant={variant}
          onClick={onClick}
          disabled={disabled}
          className={`${className} ${disabled ? 'pointer-events-none' : ''}`}
        >
          {children}
        </Button>
      </span>
    </Tooltip>
  );
};

export default TooltipButton;
