import React from 'react';

export interface HTMLProps {
  value: string;
}

const HTML: React.FC<HTMLProps> = (props) => {
  const { value } = props;
  return (
    <div
      className="no-hover"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
};

export default HTML;
