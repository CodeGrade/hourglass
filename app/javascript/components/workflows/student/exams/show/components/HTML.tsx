import React from 'react';
import { HTMLVal } from '@student/exams/show/types';

export interface HTMLProps {
  value: HTMLVal;
}

const HTML: React.FC<HTMLProps> = (props) => {
  const { value } = props;
  const theHTML = {
    __html: value?.value ?? '',
  };

  return (
    <div
      className="no-hover"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={theHTML}
    />
  );
};

export default HTML;
