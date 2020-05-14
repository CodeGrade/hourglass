import React from 'react';
import { connect } from 'react-redux';
import { Waypoint } from 'react-waypoint';
import { MSTP, MDTP } from '@hourglass/types';
import { spyQuestion } from '@hourglass/actions';

interface QScrollspyProps {
  paginated: boolean;
  question: number;
  separateSubparts: boolean;
  selectedQuestion: number;
  selectedPart: number;
  spy: (qnum: number, pnum?: number) => void;
}

const TopWaypoint: React.FC<QScrollspyProps> = (props) => {
  const {
    paginated,
    question,
    selectedQuestion,
    selectedPart,
    separateSubparts,
    spy,
  } = props;
  return (
    <Waypoint
      fireOnRapidScroll={false}
      onLeave={({ currentPosition, previousPosition }): void => {
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
  } = props;
  return (
    <Waypoint
      fireOnRapidScroll={false}
      onEnter={({ currentPosition, previousPosition }): void => {
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

const mapStateToProps: MSTP<{
  paginated: boolean;
  selectedQuestion: number;
  selectedPart: number;
}> = (state) => {
  const { paginated, pageCoords, page } = state.pagination;
  return {
    paginated,
    selectedQuestion: pageCoords[page].question,
    selectedPart: pageCoords[page].part,
  };
};

const mapDispatchToProps: MDTP<{
  spy: (question: number, pnum?: number) => void;
}> = (dispatch) => ({
  spy: (question, part): void => {
    dispatch(spyQuestion({ question, part }));
  },
});

export const TopScrollspy = connect(mapStateToProps, mapDispatchToProps)(TopWaypoint);
export const BottomScrollspy = connect(mapStateToProps, mapDispatchToProps)(BottomWaypoint);
