import React, { useMemo, useContext } from 'react';
import { PartInfo } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import DisplayBody from '@proctor/registrations/show/DisplayBody';
import '@student/exams/show/components/Part.css';
import { PartFilesContext, ExamViewerContext } from '@hourglass/common/context';
import { PartName } from '@student/exams/show/components/Part';
import ShowRubric from '@proctor/registrations/show/ShowRubric';
import { CurrentGrading } from '@hourglass/workflows/professor/exams/types';
import { pluralize } from '@hourglass/common/helpers';

interface PartProps {
  refreshCodeMirrorsDeps: React.DependencyList;
  part: PartInfo;
  qnum: number;
  pnum: number;
  currentGrading?: CurrentGrading[number][number];
  anonymous?: boolean;
}

const Part: React.FC<PartProps> = (props) => {
  const {
    refreshCodeMirrorsDeps,
    part,
    qnum,
    pnum,
    currentGrading,
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
  const strPoints = pluralize(points, 'point', 'points');
  let subtitle;
  if (currentGrading?.score !== undefined) {
    subtitle = `${currentGrading?.score} / ${strPoints}`;
  } else {
    subtitle = `(${strPoints})`;
  }
  const contextVal = useMemo(() => ({ references: reference }), [reference]);
  return (
    <PartFilesContext.Provider value={contextVal}>
      <div>
        <h3 id={`question-${qnum}-part-${pnum}`} className="d-flex align-items-baseline">
          <PartName anonymous={anonymous} name={name} pnum={pnum} />
          {anonymous || (
            <span className="ml-auto point-count">
              {subtitle}
            </span>
          )}
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
              currentGrading={currentGrading?.body[i]}
              refreshCodeMirrorsDeps={refreshCodeMirrorsDeps}
            />
          </div>
        ))}
      </div>
    </PartFilesContext.Provider>
  );
};

export default Part;
