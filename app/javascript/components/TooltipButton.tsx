import React from 'react';
import {
  Button, ButtonProps, Tooltip, OverlayTrigger, OverlayTriggerProps,
} from 'react-bootstrap';
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
  const button = (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className={disabled && 'pointer-events-none'}
    >
      {children}
    </Button>
  );
  if (disabled) {
    return (
      <OverlayTrigger
        overlay={(
          <Tooltip
            // TODO: id below for a11y
            id={null}
          >
            {disabledMessage}
          </Tooltip>
        )}
        placement={placement}
      >
        <div
          className={`d-inline-block ${disabled && 'cursor-help'}`}
        >
          {button}
        </div>
      </OverlayTrigger>
    );
  }
  return button;
};

export default TooltipButton;
