import {
  IconButton,
  Menu,
  MenuProps,
  SxProps,
  Tooltip,
  Theme,
} from '@mui/material';
import { Icon } from '@remirror/react';
import React, {
  FC, MouseEventHandler, ReactNode, useCallback, useRef, useState,
} from 'react';
import { CoreIcon, isString, uniqueId } from 'remirror';

interface ButtonIconProps {
  icon: CoreIcon | JSX.Element | null;
}

const ButtonIcon: FC<ButtonIconProps> = ({ icon }) => {
  if (isString(icon)) {
    return <Icon name={icon} size="0.75em" />;
  }

  return icon;
};

export interface DropdownButtonProps extends Omit<MenuProps, 'open' | 'anchorEl' | 'id'> {
  'aria-label': string;
  label?: NonNullable<ReactNode>;
  icon?: CoreIcon | JSX.Element;
  onClick?: MouseEventHandler<HTMLElement>;
  iconSx?: SxProps<Theme>;
}

export const RemirrorDropdownButton: FC<DropdownButtonProps> = ({
  label,
  'aria-label': ariaLabel,
  icon,
  children,
  onClick,
  onClose,
  iconSx,
  ...rest
}) => {
  const id = useRef<string>(uniqueId());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMouseDown: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleClick: MouseEventHandler<HTMLElement> = useCallback((event) => {
    setAnchorEl(event.currentTarget);
    onClick?.(event);
  }, [onClick]);

  const handleClose: MenuProps['onClose'] = useCallback(
    (e: Event, reason: 'backdropClick' | 'escapeKeyDown') => {
      setAnchorEl(null);
      onClose?.(e, reason);
    },
    [onClose],
  );

  return (
    <>
      <Tooltip title={label ?? ariaLabel}>
        <span>
          <IconButton
            aria-label={ariaLabel}
            aria-controls={open ? id.current : undefined}
            aria-haspopup
            aria-expanded={open ? 'true' : undefined}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            sx={[
              (theme) => ({
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: `${theme.shape.borderRadius}px`,
                padding: '6px 12px',
                '&:not(:first-of-type)': {
                  marginLeft: '-1px',
                  borderLeft: '1px solid transparent',
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                },
                '&:not(:last-of-type)': {
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }),
              ...(Array.isArray(iconSx) ? iconSx : [iconSx]),
            ]}
          >
            {icon && <ButtonIcon icon={icon} />}
            <Icon name="arrowDownSFill" size="0.75em" />
          </IconButton>
        </span>
      </Tooltip>
      <Menu
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest}
        id={id.current}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {children}
      </Menu>
    </>
  );
};
