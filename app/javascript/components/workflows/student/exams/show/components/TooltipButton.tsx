import React from 'react';
import {
  Button, ButtonProps, OverlayTriggerProps,
} from 'react-bootstrap';
import Tooltip from '@student/exams/show/components/Tooltip';

interface TooltipButtonProps {
  disabled: boolean;
  disabledMessage?: string;
  enabledMessage?: string;
  placement?: OverlayTriggerProps['placement'];
  onClick?: () => void;
  variant?: ButtonProps['variant'];
  className?: React.HTMLAttributes<HTMLButtonElement>['className'];
  cursorClass?: string;
  size?: ButtonProps['size'];
}

const TooltipButton: React.FC<TooltipButtonProps> = (props) => {
  const {
    disabled,
    disabledMessage,
    enabledMessage,
    onClick,
    variant = 'primary',
    placement = 'bottom',
    children,
    className,
    cursorClass = 'cursor-help',
    size,
  } = props;
  return (
    <Tooltip
      showTooltip={disabled || !!enabledMessage}
      message={disabled ? disabledMessage : enabledMessage}
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
          size={size}
        >
          {children}
        </Button>
      </span>
    </Tooltip>
  );
};

export default TooltipButton;
