import React from 'react';
import { QuestionInfo } from '@student/types';
import HTML from '@student/components/HTML';
import Part from '@proctor/registrations/show/Part';
import { FileViewer } from '@student/components/FileViewer';

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
    name,
    reference,
    description,
    parts,
  } = question;
  const title = name ? `Question ${qnum + 1}: ${name}` : `Question ${qnum + 1}`;
  const singlePart = parts.length === 1 && !parts[0].name;
  const points = parts.reduce((pts, p, _idx) => pts + p.points, 0);
  const strPoints = points > 1 || points === 0 ? 'points' : 'point';
  const subtitle = `(${points} ${strPoints})`;
  return (
    <div>
      <h1>
        {title}
        {singlePart && (
          <small className="float-right text-muted">
            {subtitle}
          </small>
        )}
      </h1>
      <HTML value={description} />
      {reference && <FileViewer references={reference} />}
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
  );
};
export default ShowQuestion;
