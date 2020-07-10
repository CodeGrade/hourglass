import React, { useMemo } from 'react';
import { QuestionInfo } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import Part from '@proctor/registrations/show/Part';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import { QuestionFilesContext } from '@student/exams/show/context';

interface ShowQuestionProps {
  refreshCodeMirrorsDeps: React.DependencyList;
  question: QuestionInfo;
  qnum: number;
}

const ShowQuestion: React.FC<ShowQuestionProps> = (props) => {
  const {
    refreshCodeMirrorsDeps,
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
  const singlePart = parts.length === 1 && !parts[0].name.value;
  const points = parts.reduce((pts, p, _idx) => pts + p.points, 0);
  const strPoints = points > 1 || points === 0 ? 'points' : 'point';
  const subtitle = `(${points} ${strPoints})`;
  const contextVal = useMemo(() => ({ references: reference }), [reference]);
  return (
    <QuestionFilesContext.Provider value={contextVal}>
      <div>
        <h1>
          <div className="d-inline-block">
            <HTML value={name} />
          </div>
          {singlePart && (
            <small className="float-right text-muted">
              {subtitle}
            </small>
          )}
        </h1>
        <HTML value={description} />
        {reference.length !== 0 && (
          <FileViewer
            references={reference}
            refreshProps={refreshCodeMirrorsDeps}
          />
        )}
        {parts.map((p, i) => (
          <Part
            // Part numbers are STATIC.
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            anonymous={singlePart}
            part={p}
            pnum={i}
            qnum={qnum}
            refreshCodeMirrorsDeps={refreshCodeMirrorsDeps}
          />
        ))}
      </div>
    </QuestionFilesContext.Provider>
  );
};
export default ShowQuestion;
