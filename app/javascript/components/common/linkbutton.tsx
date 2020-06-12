import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

const LinkButton: React.FC<ButtonProps & {
  to: string;
  onClick?: React.DOMAttributes<HTMLButtonElement>['onClick'];
  className?: React.HTMLAttributes<HTMLButtonElement>['className'];
}> = (props) => {
  const {
    children,
    onClick,
    to,
    className,
  } = props;
  const history = useHistory();
  return (
    <Button
      className={className}
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
