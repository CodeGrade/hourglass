import React from 'react';
import {
  Tooltip as BSTooltip,
  OverlayTrigger,
  OverlayTriggerProps,
} from 'react-bootstrap';

interface TooltipProps {
  message: string;
  showTooltip?: boolean;
  placement?: OverlayTriggerProps['placement'];
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = (props) => {
  const {
    message,
    showTooltip = true,
    placement = 'bottom',
    className = '',
    children,
  } = props;
  const tooltip = showTooltip
    ? (
      <BSTooltip
        // TODO: id below for a11y
        id={null}
      >
        {message}
      </BSTooltip>
    )
    : ((): JSX.Element => <span />);
  return (
    <OverlayTrigger
      overlay={tooltip}
      placement={placement}
    >
      <span
        className={className}
      >
        {children}
      </span>
    </OverlayTrigger>
  );
};

export default Tooltip;
