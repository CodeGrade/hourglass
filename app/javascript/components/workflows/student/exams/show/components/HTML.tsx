import React from 'react';

export interface HTMLProps {
  value: string;
  className?: string;
}

const HTML: React.FC<HTMLProps> = (props) => {
  const { value, className = 'no-hover' } = props;
  const theHTML = {
    __html: value,
  };

  return (
    <div
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={theHTML}
    />
  );
};

export default HTML;
