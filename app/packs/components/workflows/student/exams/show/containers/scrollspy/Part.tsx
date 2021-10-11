import React from 'react';
import { Waypoint } from 'react-waypoint';
import connect from './connectors';

interface PScrollspyProps {
  paginated: boolean;
  question: number;
  part: number;
  separateSubparts: boolean;
  selectedQuestion: number;
  selectedPart: number;
  spy: (qnum: number, pnum?: number) => void;
  waypointsActive: boolean;
}

const TopWaypoint: React.FC<PScrollspyProps> = (props) => {
  const {
    paginated,
    question,
    part,
    selectedQuestion,
    selectedPart,
    separateSubparts,
    spy,
    waypointsActive,
  } = props;
  return (
    <Waypoint
      fireOnRapidScroll={false}
      onLeave={({ currentPosition, previousPosition }): void => {
        if (!waypointsActive) return;
        if (paginated && selectedQuestion !== question) return;
        if (paginated && separateSubparts && selectedPart !== part) return;
        if (currentPosition === Waypoint.above && previousPosition === Waypoint.inside) {
          spy(question, part);
        }
      }}
    />
  );
};

const BottomWaypoint: React.FC<PScrollspyProps> = (props) => {
  const {
    paginated,
    question,
    part,
    selectedQuestion,
    selectedPart,
    separateSubparts,
    spy,
    waypointsActive,
  } = props;
  return (
    <Waypoint
      fireOnRapidScroll={false}
      onEnter={({ currentPosition, previousPosition }): void => {
        if (!waypointsActive) return;
        if (paginated && selectedQuestion !== question) return;
        if (paginated && separateSubparts && selectedPart !== part) return;
        if (currentPosition === Waypoint.inside && previousPosition === Waypoint.above) {
          spy(question, part);
        }
      }}
    />
  );
};

export const TopScrollspy = connect(TopWaypoint);
export const BottomScrollspy = connect(BottomWaypoint);
