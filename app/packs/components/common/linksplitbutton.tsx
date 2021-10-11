import React from 'react';
import { SplitButton, SplitButtonProps } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

const LinkSplitButton: React.FC<SplitButtonProps & {
  to: string;
  onClick?: SplitButtonProps['onClick'];
}> = (props) => {
  const {
    children,
    onClick,
    to,
  } = props;
  const history = useHistory();
  return (
    <SplitButton
      onClick={(event): void => {
        if (onClick) onClick(event);
        history.push(to);
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      {children}
    </SplitButton>
  );
};
export default LinkSplitButton;
