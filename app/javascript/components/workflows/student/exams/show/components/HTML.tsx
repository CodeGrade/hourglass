import React from 'react';
import { HTMLVal } from '@student/exams/show/types';

export interface HTMLProps {
  value: HTMLVal;
}

const HTML: React.FC<HTMLProps> = (props) => {
  const { value } = props;
  return (
    <div
      className="no-hover"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: value.value }}
    />
  );
};

export default HTML;
