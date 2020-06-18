import React from 'react';
import { QuestionInfo } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import Part from '@proctor/registrations/show/Part';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import { QuestionFilesContext } from '@hourglass/workflows/student/exams/show/context';

interface ShowQuestionProps {
  question: QuestionInfo;
  qnum: number;
}

const ShowQuestion: React.FC<ShowQuestionProps> = (props) => {
  const {
    question,
    qnum,
  } = props;
  const {
    name = {
      type: 'HTML',
      value: `Question ${qnum + 1}`,
    },
    reference,
    description,
    parts,
  } = question;
  const singlePart = parts.length === 1 && !parts[0].name;
  const points = parts.reduce((pts, p, _idx) => pts + p.points, 0);
  const strPoints = points > 1 || points === 0 ? 'points' : 'point';
  const subtitle = `(${points} ${strPoints})`;
  return (
    <QuestionFilesContext.Provider value={{ references: reference }}>
      <div>
        <h1>
          <HTML value={name} />
          {singlePart && (
            <small className="float-right text-muted">
              {subtitle}
            </small>
          )}
        </h1>
        <HTML value={description} />
        {reference.length !== 0 && <FileViewer references={reference} />}
        {parts.map((p, i) => (
          <Part
            // Part numbers are STATIC.
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            anonymous={singlePart}
            part={p}
            pnum={i}
            qnum={qnum}
          />
        ))}
      </div>
    </QuestionFilesContext.Provider>
  );
};
export default ShowQuestion;
