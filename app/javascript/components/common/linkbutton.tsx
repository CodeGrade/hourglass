import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

const LinkButton: React.FC<ButtonProps & {
  to: string;
  onClick?: React.DOMAttributes<HTMLButtonElement>['onClick'];
}> = (props) => {
  const {
    children,
    onClick,
    to,
  } = props;
  const history = useHistory();
  return (
    <Button
      onClick={(event): void => {
        if (onClick) onClick(event);
        history.push(to);
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      {children}
    </Button>
  );
};
export default LinkButton;
