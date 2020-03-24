import React from 'react';

interface CodeTagProps {
  codetag: CodeTag;
  qnum: number;
  pnum: number;
  bnum: number;
}

export function CodeTag(props: CodeTagProps) {
  const { codetag } = props;
  const { choices } = codetag;
  return (
    <p>
      TODO: CodeTag with choices from <i>{choices}</i>.
    </p>
  );
}
