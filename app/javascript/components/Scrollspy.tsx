import React from 'react';
import { Waypoint } from 'react-waypoint';

interface ScrollspyProps {
  qnum: number;
  pnum?: number;
  viewQuestion: (qnum: number, pnum?: number) => void;
}

export const ScrollspyTop: React.FC<ScrollspyProps> = (props) => {
  const {
    qnum,
    pnum,
    viewQuestion,
  } = props;
  return (
    <Waypoint
      onPositionChange={({ currentPosition, previousPosition }): void => {
        if (currentPosition === Waypoint.above && previousPosition === Waypoint.inside) {
          viewQuestion(qnum, pnum);
        }
      }}
    />
  );
};

export const ScrollspyBottom: React.FC<ScrollspyProps> = (props) => {
  const {
    qnum,
    pnum,
    viewQuestion,
  } = props;
  return (
    <Waypoint
      onPositionChange={({ currentPosition, previousPosition }): void => {
        if (currentPosition === Waypoint.inside && previousPosition === Waypoint.above) {
          viewQuestion(qnum, pnum);
        }
      }}
    />
  );
};
