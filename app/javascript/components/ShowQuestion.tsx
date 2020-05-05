import React from 'react';
import { QuestionInfo } from '@hourglass/types';
import HTML from '@hourglass/components/HTML';
import Part from './Part';
import { FileViewer } from './FileViewer';

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
    separateSubparts, // TODO
    parts,
  } = question;
  return (
    <div id={`question-${qnum}`} className={`question no-gutters ${separateSubparts ? 'paginated' : ''}`}>
      <h1>{`Question ${qnum + 1}: ${name}`}</h1>
      <HTML value={description} />
      {reference && <FileViewer references={reference} />}
      {parts.map((p, i) => (
        <Part
          part={p}
          pnum={i}
          qnum={qnum}
          key={i}
        />
      ))}
    </div>
  );
};
export default ShowQuestion;
