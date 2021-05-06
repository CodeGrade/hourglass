import React, { useMemo } from 'react';
import { QuestionInfo, HTMLVal } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import Part from '@student/exams/show/components/Part';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import PaginationArrows from '@student/exams/show/containers/PaginationArrows';
import {
  TopScrollspy,
  BottomScrollspy,
} from '@student/exams/show/containers/scrollspy/Question';
import SubmitButton from '@student/exams/show/containers/SubmitButton';
import { QuestionFilesContext } from '@hourglass/common/context';

interface ShowQuestionProps {
  examTakeUrl: string;
  question: QuestionInfo;
  qnum: number;
  paginated: boolean;
  selectedQuestion?: number;
  selectedPart?: number;
  spyQuestion?: (question: number, pnum?: number) => void;
  lastQuestion?: boolean;
  cleanupBeforeSubmit: () => void;
}

export const QuestionName: React.FC<{ qnum: number; name?: HTMLVal }> = ({ qnum, name }) => {
  if (name?.value === undefined || name.value === '') {
    return <div className="d-inline-block">{`Question ${qnum + 1}`}</div>;
  }
  return (
    <>
      <span className="d-inline-block mr-2">{`Question ${qnum + 1}: `}</span>
      <HTML value={name} className="d-inline-block" />
    </>
  );
};

const ShowQuestion: React.FC<ShowQuestionProps> = (props) => {
  const {
    examTakeUrl,
    question,
    qnum,
    paginated,
    selectedQuestion,
    selectedPart,
    spyQuestion,
    lastQuestion = false,
    cleanupBeforeSubmit,
  } = props;
  const {
    name,
    references,
    description,
    parts,
    separateSubparts,
  } = question;
  const split = paginated && separateSubparts;
  const isCurrent = selectedQuestion === qnum;
  const active = !paginated || isCurrent;
  const classes = active ? '' : 'd-none';
  const singlePart = parts.length === 1 && !parts[0].name?.value?.trim();
  const points = parts.reduce((pts, p, _idx) => pts + p.points, 0);
  const strPoints = points > 1 || points === 0 ? 'points' : 'point';
  const subtitle = `(${points} ${strPoints})`;
  const questionFilesContextVal = useMemo(() => ({
    references,
  }), [references]);
  return (
    <QuestionFilesContext.Provider value={questionFilesContextVal}>
      <div className={classes}>
        <TopScrollspy
          question={qnum}
          separateSubparts={separateSubparts}
        />
        <h1 id={`question-${qnum}`} className="d-flex align-items-baseline">
          <QuestionName name={name} qnum={qnum} />
          {singlePart && (
            <span className="ml-auto point-count">
              {subtitle}
            </span>
          )}
        </h1>
        <HTML value={description} />
        {references && references.length !== 0 && <FileViewer references={references} />}
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
              <div className={showArrows ? 'mb-5' : 'd-none'}>
                <PaginationArrows />
              </div>
              {showSubmit && (
                <div className="text-center mb-5">
                  <SubmitButton
                    examTakeUrl={examTakeUrl}
                    cleanupBeforeSubmit={cleanupBeforeSubmit}
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
