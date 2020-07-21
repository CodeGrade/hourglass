import React, { useMemo, useContext } from 'react';
import { QuestionInfo } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import Part from '@proctor/registrations/show/Part';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import { QuestionFilesContext, ExamViewerContext } from '@hourglass/common/context';
import { QuestionName } from '@student/exams/show/components/ShowQuestion';
import ShowRubric from '@proctor/registrations/show/ShowRubric';

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
    name,
    reference,
    description,
    parts,
  } = question;
  const { rubric } = useContext(ExamViewerContext);
  const qRubric = rubric?.questions[qnum]?.questionRubric;
  const singlePart = parts.length === 1 && !parts[0].name.value;
  const points = parts.reduce((pts, p, _idx) => pts + p.points, 0);
  const strPoints = points > 1 || points === 0 ? 'points' : 'point';
  const subtitle = `(${points} ${strPoints})`;
  const contextVal = useMemo(() => ({ references: reference }), [reference]);
  return (
    <QuestionFilesContext.Provider value={contextVal}>
      <div>
        <h1>
          {singlePart && (
            <small className="float-right text-muted">
              {subtitle}
            </small>
          )}
          <QuestionName name={name} qnum={qnum} />
        </h1>
        <HTML value={description} />
        {reference.length !== 0 && (
          <FileViewer
            references={reference}
            refreshProps={refreshCodeMirrorsDeps}
          />
        )}
        {qRubric && <ShowRubric rubric={qRubric} />}
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
