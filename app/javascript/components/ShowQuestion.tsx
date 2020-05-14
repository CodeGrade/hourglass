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
  paginated: boolean;
  selectedQuestion?: number;
  selectedPart?: number;
  displayOnly?: boolean;
}

const ShowQuestion: React.FC<ShowQuestionProps> = (props) => {
  const {
    question,
    qnum,
    paginated,
    selectedQuestion,
    selectedPart,
    displayOnly = false,
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
      {displayOnly || (
        <TopScrollspy
          question={qnum}
          separateSubparts={separateSubparts}
        />
      )}
      <h1 id={`question-${qnum}`}>{`Question ${qnum + 1}: ${name}`}</h1>
      <HTML value={description} />
      {reference && <FileViewer references={reference} />}
      {displayOnly || (
        <BottomScrollspy
          question={qnum}
          separateSubparts={separateSubparts}
        />
      )}
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
              separateSubparts={separateSubparts}
              displayOnly={displayOnly}
            />
            {displayOnly || (
              <div className={showArrows ? '' : 'd-none'}>
                <PaginationArrows />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default ShowQuestion;
