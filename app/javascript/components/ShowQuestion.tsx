import React from 'react';
import { QuestionInfo } from '@hourglass/types';
import HTML from '@hourglass/components/HTML';
import { BodyProps } from '@hourglass/components/Body';
import Part from '@hourglass/components/Part';
import { FileViewer } from '@hourglass/components/FileViewer';
import PaginationArrows from '@hourglass/containers/PaginationArrows';
import {
  TopScrollspy,
  BottomScrollspy,
} from '@hourglass/containers/scrollspy/Question';

interface ShowQuestionProps {
  question: QuestionInfo;
  qnum: number;
  BodyRenderer: React.ComponentType<BodyProps>;
  paginated: boolean;
  selectedQuestion?: number;
  selectedPart?: number;
}

const ShowQuestion: React.FC<ShowQuestionProps> = (props) => {
  const {
    question,
    qnum,
    BodyRenderer,
    paginated,
    selectedQuestion,
    selectedPart,
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
      <TopScrollspy
        question={qnum}
        separateSubparts={separateSubparts}
      />
      <h1 id={`question-${qnum}`}>{`Question ${qnum + 1}: ${name}`}</h1>
      <HTML value={description} />
      {reference && <FileViewer references={reference} />}
      <BottomScrollspy
        question={qnum}
        separateSubparts={separateSubparts}
      />
      {parts.map((p, i) => {
        const current = selectedPart === i;
        const activePart = !split || current;
        const activeClass = activePart ? '' : 'd-none';
        const lastPart = i === parts.length - 1;
        const showArrows = separateSubparts || lastPart;
        return (
          <div
            // Part numbers are STATIC.
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={activeClass}
          >
            <Part
              part={p}
              pnum={i}
              qnum={qnum}
              BodyRenderer={BodyRenderer}
              separateSubparts={separateSubparts}
            />
            <div className={showArrows ? '' : 'd-none'}>
              <PaginationArrows />
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default ShowQuestion;
