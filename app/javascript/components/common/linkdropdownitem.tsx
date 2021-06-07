import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { DropdownItemProps } from 'react-bootstrap/esm/DropdownItem';

const LinkDropdownItem: React.FC<DropdownItemProps & {
  to: string;
  onClick?: DropdownItemProps['onClick'];
}> = (props) => {
  const {
    children,
    onClick,
    to,
  } = props;
  const history = useHistory();
  return (
    <Dropdown.Item
      onClick={(event): void => {
        if (onClick) onClick(event);
        history.push(to);
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      {children}
    </Dropdown.Item>
  );
};
export default LinkDropdownItem;
