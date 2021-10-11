import React from 'react';
import {
  Tooltip as BSTooltip,
  OverlayTrigger,
  OverlayTriggerProps,
} from 'react-bootstrap';

export interface TooltipProps {
  message: string;
  className?: string;
  showTooltip?: boolean;
  defaultShow?: boolean;
  placement?: OverlayTriggerProps['placement'];
  children: React.ReactElement;
}

const Tooltip: React.FC<TooltipProps> = (props) => {
  const {
    message,
    className,
    showTooltip = true,
    defaultShow,
    placement = 'bottom',
    children,
  } = props;
  const tooltip = showTooltip
    ? (
      <BSTooltip
        className={className}
        id={null}
      >
        {message}
      </BSTooltip>
    )
    : ((): JSX.Element => <span />);
  return (
    <OverlayTrigger
      show={defaultShow}
      overlay={tooltip}
      placement={placement}
    >
      {children}
    </OverlayTrigger>
  );
};

export default Tooltip;
