import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

const LinkButton: React.FC<ButtonProps & {
  to: string;
  onClick?: React.DOMAttributes<HTMLButtonElement>['onClick'];
  className?: React.HTMLAttributes<HTMLButtonElement>['className'];
  afterNavigate?: () => void;
}> = (props) => {
  const {
    children,
    onClick,
    to,
    className,
    afterNavigate,
  } = props;
  const history = useHistory();
  return (
    <Button
      className={className}
      onClick={(event): void => {
        if (onClick) onClick(event);
        history.push(to);
        afterNavigate();
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      {children}
    </Button>
  );
};
export default LinkButton;
