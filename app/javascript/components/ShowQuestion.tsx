import React from 'react';
import { QuestionInfo } from '@hourglass/types';
import HTML from '@hourglass/components/HTML';
import { BodyProps } from '@hourglass/components/Body';
import Part from './Part';
import { FileViewer } from './FileViewer';

interface ShowQuestionProps {
  question: QuestionInfo;
  qnum: number;
  BodyRenderer: React.ComponentType<BodyProps>;
}

const ShowQuestion: React.FC<ShowQuestionProps> = (props) => {
  const {
    question,
    qnum,
    BodyRenderer,
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
          // Part numbers are STATIC.
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          BodyRenderer={BodyRenderer}
        />
      ))}
    </div>
  );
};
export default ShowQuestion;
