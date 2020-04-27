import React from 'react';
import { CodeTag } from '../../types';

interface CodeTagProps {
  info: CodeTag;
}

export function CodeTag(props: CodeTagProps) {
  const { info } = props;
  const { choices } = info;
  return (
    <p>
      TODO: CodeTag with choices from <i>{choices}</i>.
    </p>
  );
}
