import React, { useContext } from 'react';
import { QuestionInfo } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import Part from '@student/exams/show/components/Part';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import PaginationArrows from '@student/exams/show/containers/PaginationArrows';
import {
  TopScrollspy,
  BottomScrollspy,
} from '@student/exams/show/containers/scrollspy/Question';
import SubmitButton from '@student/exams/show/containers/SubmitButton';
import { RailsContext, QuestionFilesContext } from '@student/exams/show/context';

interface ShowQuestionProps {
  question: QuestionInfo;
  qnum: number;
  paginated: boolean;
  selectedQuestion?: number;
  selectedPart?: number;
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
    spyQuestion,
    lastQuestion = false,
  } = props;
  const {
    name = {
      type: 'HTML',
      value: `Question ${qnum + 1}`,
    },
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
  const singlePart = parts.length === 1 && !parts[0].name;
  const points = parts.reduce((pts, p, _idx) => pts + p.points, 0);
  const strPoints = points > 1 || points === 0 ? 'points' : 'point';
  const subtitle = `(${points} ${strPoints})`;
  return (
    <QuestionFilesContext.Provider value={{ references: reference }}>
      <div className={classes}>
        <TopScrollspy
          question={qnum}
          separateSubparts={separateSubparts}
        />
        <h1 id={`question-${qnum}`}>
          <HTML value={name} />
          {singlePart && (
            <small className="float-right text-muted">
              {subtitle}
            </small>
          )}
        </h1>
        <HTML value={description} />
        {reference.length !== 0 && <FileViewer references={reference} />}
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
                spyQuestion={spyQuestion}
              />
              <div className={showArrows ? '' : 'd-none'}>
                <PaginationArrows />
              </div>
              {showSubmit && (
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
    </QuestionFilesContext.Provider>
  );
};
export default ShowQuestion;
