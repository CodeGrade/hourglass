import React from 'react';
import Code from '@student/exams/show/components/questions/Code';
import { CodeState, CodeInfo } from '@student/exams/show/types';

interface CodeProps {
  info: CodeInfo;
  value?: CodeState;
}

const DisplayCode: React.FC<CodeProps> = (props) => {
  const {
    info,
    value,
  } = props;
  return (
    <Code info={info} value={value} disabled autosize />
  );
};

export default DisplayCode;
