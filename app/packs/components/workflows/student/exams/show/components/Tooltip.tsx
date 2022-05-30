import React, { useState } from 'react';
import {
  Tooltip as BSTooltip,
  OverlayTrigger,
  OverlayTriggerProps,
} from 'react-bootstrap';
import { OverlayInjectedProps } from 'react-bootstrap/esm/Overlay';

export interface TooltipProps {
  message: string;
  className?: string;
  showTooltip?: 'always' | 'never' | 'onHover';
  placement?: OverlayTriggerProps['placement'];
  children: React.ReactElement;
}

// NOTE(Ben, 5/30): This hackaround seems to be needed to fix
// https://github.com/react-bootstrap/react-bootstrap/issues/6010
// When we upgrade react-bootstrap to something greater than 2.4.1,
// we should get this fix automatically, and can go back to a simpler
// OverlayTrigger/BSTooltip without needing this workaround.
const UpdatingTooltip = React.forwardRef<HTMLDivElement, OverlayInjectedProps>(({
  popper,
  children,
  style,
  arrowProps,
  className,
  placement,
  ...props
}, ref) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <span {...props} style={{ ...style, position: 'absolute', transform: undefined }}>
    <BSTooltip
      id={null}
      ref={ref}
      placement={placement}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      style={{ ...style, position: 'relative' }}
      className={className}
      arrowProps={arrowProps}
    >
      {children}
    </BSTooltip>
  </span>
));

const Tooltip: React.FC<TooltipProps> = (props) => {
  const {
    message,
    className,
    showTooltip = 'onHover',
    placement = 'bottom',
    children,
  } = props;
  const [show, setShow] = useState(showTooltip === 'always');
  return (
    <OverlayTrigger
      show={show}
      onToggle={(nextShow) => {
        setShow((showTooltip !== 'never') && nextShow);
      }}
      overlay={<UpdatingTooltip className={className}>{message}</UpdatingTooltip>}
      placement={placement}
    >
      {children}
    </OverlayTrigger>
  );
};

export default Tooltip;
