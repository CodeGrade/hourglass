import React from 'react';
import { Waypoint } from 'react-waypoint';
import connect from './connectors';

interface QScrollspyProps {
  paginated: boolean;
  question: number;
  separateSubparts: boolean;
  selectedQuestion: number;
  selectedPart: number;
  spy: (qnum: number, pnum?: number) => void;
  waypointsActive: boolean;
}

const TopWaypoint: React.FC<QScrollspyProps> = (props) => {
  const {
    paginated,
    question,
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
        if (paginated && separateSubparts) {
          spy(question, selectedPart);
        } else if (currentPosition === Waypoint.above && previousPosition === Waypoint.inside) {
          spy(question);
        }
      }}
    />
  );
};

const BottomWaypoint: React.FC<QScrollspyProps> = (props) => {
  const {
    paginated,
    question,
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
        if (paginated && separateSubparts) {
          spy(question, selectedPart);
        } else if (currentPosition === Waypoint.inside && previousPosition === Waypoint.above) {
          spy(question);
        }
      }}
    />
  );
};

export const TopScrollspy = connect(TopWaypoint);
export const BottomScrollspy = connect(BottomWaypoint);
