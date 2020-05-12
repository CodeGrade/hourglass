import React from 'react';
import { Waypoint } from 'react-waypoint';

interface ScrollspyProps {
  paginated: boolean;
  selectedQuestion: number;
  qnum: number;
  pnum?: number;
  spyQuestion: (qnum: number, pnum?: number) => void;
}

export const ScrollspyTop: React.FC<ScrollspyProps> = (props) => {
  const {
    paginated,
    selectedQuestion,
    qnum,
    pnum,
    spyQuestion,
  } = props;
  return (
    <Waypoint
      fireOnRapidScroll={false}
      onLeave={({ currentPosition }): void => {
        if (paginated && selectedQuestion !== qnum) return;
        if (currentPosition === Waypoint.above) {
          spyQuestion(qnum, pnum);
        }
      }}
    />
  );
};

export const ScrollspyBottom: React.FC<ScrollspyProps> = (props) => {
  const {
    paginated,
    selectedQuestion,
    qnum,
    pnum,
    spyQuestion,
  } = props;
  return (
    <Waypoint
      fireOnRapidScroll={false}
      onEnter={({ previousPosition }): void => {
        if (paginated && selectedQuestion !== qnum) return;
        if (previousPosition === Waypoint.above) {
          spyQuestion(qnum, pnum);
        }
      }}
    />
  );
};
