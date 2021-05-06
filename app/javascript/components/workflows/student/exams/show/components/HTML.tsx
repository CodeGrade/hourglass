import React from 'react';
import { HTMLVal } from '@student/exams/show/types';

export interface HTMLProps {
  value: HTMLVal;
  className?: string;
}

const HTML: React.FC<HTMLProps> = (props) => {
  const { value, className = 'no-hover' } = props;
  const theHTML = {
    __html: value?.value ?? '',
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
