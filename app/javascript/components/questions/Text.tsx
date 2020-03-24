import React from 'react';

interface TextProps {
  text: Text;
  qnum: number;
  pnum: number;
  bnum: number;
}

export function Text(props: TextProps) {
  const { text, qnum, pnum, bnum } = props;
  const { prompt } = text;
  return (
    <p>TODO: Text</p>
  );
}
