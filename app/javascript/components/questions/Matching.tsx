import React from 'react';

interface MatchingProps {
  matching: Matching;
  qnum: number;
  pnum: number;
  bnum: number;
}

export function Matching(props: MatchingProps) {
  const { matching, qnum, pnum, bnum } = props;
  const { prompt, values } = matching;
  return (
    <p>
      TODO: Matching
    </p>
  );
}
