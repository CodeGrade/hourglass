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
  // TODO: id below for a11y
  const tooltip = (
    <Tooltip
      id={null}
    >
      {disabledMessage}
    </Tooltip>
  );
  const noTooltip = <span />;
  return (
    <OverlayTrigger
      overlay={disabled ? tooltip : noTooltip}
      placement={placement}
    >
      <div
        className={`d-inline-block ${disabled && 'cursor-not-allowed'}`}
      >
        <Button
          variant={variant}
          onClick={onClick}
          disabled={disabled}
          className={disabled && 'pointer-events-none'}
        >
          {children}
        </Button>
      </div>
    </OverlayTrigger>
  );
};

export default TooltipButton;
