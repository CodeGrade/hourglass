import React, { useContext } from 'react';
import { QuestionInfo } from '@hourglass/types';
import HTML from '@hourglass/components/HTML';
import Part from '@hourglass/components/Part';
import { FileViewer } from '@hourglass/components/FileViewer';
import PaginationArrows from '@hourglass/containers/PaginationArrows';
import {
  TopScrollspy,
  BottomScrollspy,
} from '@hourglass/containers/scrollspy/Question';
import SubmitButton from '@hourglass/containers/SubmitButton';
import { RailsContext } from '@hourglass/context';

interface ShowQuestionProps {
  question: QuestionInfo;
  qnum: number;
  paginated: boolean;
  selectedQuestion?: number;
  selectedPart?: number;
  displayOnly?: boolean;
  spyQuestion?: (question: number, pnum?: number) => void;
  lastQuestion?: boolean;
}

const ShowQuestion: React.FC<ShowQuestionProps> = (props) => {
  const {
    question,
    qnum,
    paginated,
    selectedQuestion,
    selectedPart,
    displayOnly = false,
    spyQuestion,
    lastQuestion = false,
  } = props;
  const {
    name,
    reference,
    description,
    parts,
    separateSubparts,
  } = question;
  const {
    railsExam,
  } = useContext(RailsContext);
  const split = paginated && separateSubparts;
  const isCurrent = selectedQuestion === qnum;
  const active = !paginated || isCurrent;
  const classes = active ? '' : 'd-none';
  const title = name ? `Question ${qnum + 1}: ${name}` : `Question ${qnum + 1}`;
  const singlePart = parts.length === 1 && !parts[0].name;
  const points = parts.reduce((pts, p, _idx) => pts + p.points, 0);
  const strPoints = points > 1 || points === 0 ? 'points' : 'point';
  const subtitle = `(${points} ${strPoints})`;
  return (
    <div className={classes}>
      {displayOnly || (
        <TopScrollspy
          question={qnum}
          separateSubparts={separateSubparts}
        />
      )}
      <h1 id={`question-${qnum}`}>
        {title}
        {singlePart && (
          <small className="float-right text-muted">
            {subtitle}
          </small>
        )}
      </h1>
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
        const showSubmit = lastPart && lastQuestion;
        return (
          <div
            // Part numbers are STATIC.
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={activeClass}
          >
            <Part
              anonymous={singlePart}
              part={p}
              pnum={i}
              qnum={qnum}
              separateSubparts={separateSubparts}
              displayOnly={displayOnly}
              spyQuestion={spyQuestion}
            />
            {!displayOnly && (
              <div className={showArrows ? '' : 'd-none'}>
                <PaginationArrows />
              </div>
            )}
            {!displayOnly && showSubmit && (
              <div className="text-center">
                <SubmitButton
                  examID={railsExam.id}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default ShowQuestion;
