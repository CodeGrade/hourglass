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
}

const Tooltip: React.FC<TooltipProps> = (props) => {
  const {
    message,
    showTooltip = true,
    placement = 'bottom',
    children,
  } = props;
  const tooltip = showTooltip
    ? (
      <BSTooltip
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
      <>
        {children}
      </>
    </OverlayTrigger>
  );
};

export default Tooltip;
