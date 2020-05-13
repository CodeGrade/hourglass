import React from 'react';
import { QuestionInfo } from '@hourglass/types';
import HTML from '@hourglass/components/HTML';
import { BodyProps } from '@hourglass/components/Body';
import { Waypoint } from 'react-waypoint';
import Part from '@hourglass/components/Part';
import { FileViewer } from '@hourglass/components/FileViewer';

interface ShowQuestionProps {
  question: QuestionInfo;
  qnum: number;
  BodyRenderer: React.ComponentType<BodyProps>;
  paginated: boolean;
  selectedQuestion?: number;
  selectedPart?: number;
  spyQuestion?: (qnum: number, pnum?: number) => void;
}

const ShowQuestion: React.FC<ShowQuestionProps> = (props) => {
  const {
    question,
    qnum,
    BodyRenderer,
    paginated,
    selectedQuestion,
    selectedPart,
    spyQuestion,
  } = props;
  const {
    name,
    reference,
    description,
    parts,
    separateSubparts,
  } = question;
  const split = paginated && separateSubparts;
  const isCurrent = selectedQuestion === qnum;
  const active = !paginated || isCurrent;
  const classes = active ? '' : 'd-none';
  return (
    <div className={classes}>
      <Waypoint
        fireOnRapidScroll={false}
        onLeave={({ currentPosition, previousPosition }): void => {
          if (paginated && selectedQuestion !== qnum) return;
          if (paginated && separateSubparts) {
            spyQuestion(qnum, selectedPart);
          } else if (currentPosition === Waypoint.above && previousPosition === Waypoint.inside) {
            spyQuestion(qnum);
          }
        }}
      />
      <h1 id={`question-${qnum}`}>{`Question ${qnum + 1}: ${name}`}</h1>
      <HTML value={description} />
      {reference && <FileViewer references={reference} />}
      <Waypoint
        fireOnRapidScroll={false}
        onEnter={({ currentPosition, previousPosition }): void => {
          if (paginated && selectedQuestion !== qnum) return;
          if (paginated && separateSubparts) {
            spyQuestion(qnum, selectedPart);
          } else if (currentPosition === Waypoint.inside && previousPosition === Waypoint.above) {
            spyQuestion(qnum);
          }
        }}
      />
      {parts.map((p, i) => {
        const current = selectedPart === i;
        const activePart = !split || current;
        const activeClass = activePart ? '' : 'd-none';
        return (
          <div
            // Part numbers are STATIC.
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={activeClass}
          >
            <Part
              spyQuestion={spyQuestion}
              part={p}
              pnum={i}
              qnum={qnum}
              BodyRenderer={BodyRenderer}
            />
          </div>
        );
      })}
    </div>
  );
};
export default ShowQuestion;
