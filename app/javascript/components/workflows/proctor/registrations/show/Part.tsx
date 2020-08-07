import React, { useMemo, useContext } from 'react';
import { PartInfo } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import DisplayBody from '@proctor/registrations/show/DisplayBody';
import '@student/exams/show/components/Part.css';
import { PartFilesContext, ExamViewerContext } from '@hourglass/common/context';
import { PartName } from '@student/exams/show/components/Part';
import ShowRubric from '@proctor/registrations/show/ShowRubric';

interface PartProps {
  refreshCodeMirrorsDeps: React.DependencyList;
  part: PartInfo;
  qnum: number;
  pnum: number;
  anonymous?: boolean;
}

const Part: React.FC<PartProps> = (props) => {
  const {
    refreshCodeMirrorsDeps,
    part,
    qnum,
    pnum,
    anonymous,
  } = props;
  const {
    name,
    reference,
    description,
    points,
    body,
  } = part;
  const { rubric } = useContext(ExamViewerContext);
  const pRubric = rubric?.questions[qnum]?.parts[pnum]?.partRubric;
  const strPoints = points > 1 || points === 0 ? 'points' : 'point';
  const subtitle = `(${points} ${strPoints})`;
  const contextVal = useMemo(() => ({ references: reference }), [reference]);
  return (
    <PartFilesContext.Provider value={contextVal}>
      <div>
        <h3 id={`question-${qnum}-part-${pnum}`}>
          {anonymous || (
            <small className="float-right text-muted">
              {subtitle}
            </small>
          )}
          <PartName name={name} pnum={pnum} />
        </h3>
        {description?.value && <HTML value={description} />}
        {reference.length !== 0 && (
          <FileViewer
            references={reference}
            refreshProps={refreshCodeMirrorsDeps}
          />
        )}
        {pRubric && <ShowRubric rubric={pRubric} />}
        {body.map((b, i) => (
          // Body numbers are STATIC.
          // eslint-disable-next-line react/no-array-index-key
          <div className={`p-2 bodyitem ${b.type}`} key={i}>
            <DisplayBody
              body={b}
              qnum={qnum}
              pnum={pnum}
              bnum={i}
              refreshCodeMirrorsDeps={refreshCodeMirrorsDeps}
            />
          </div>
        ))}
      </div>
    </PartFilesContext.Provider>
  );
};

export default Part;
