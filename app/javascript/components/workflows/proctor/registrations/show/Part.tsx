import React, { useMemo } from 'react';
import { PartInfo } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import DisplayBody from '@proctor/registrations/show/DisplayBody';
import '@student/exams/show/components/Part.css';
import { PartFilesContext } from '@student/exams/show/context';
import { alphabetIdx } from '@hourglass/common/helpers';

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
    name = {
      type: 'HTML',
      value: `Part ${alphabetIdx(pnum)}`,
    },
    reference,
    description,
    points,
    body,
  } = part;
  const strPoints = points > 1 || points === 0 ? 'points' : 'point';
  const subtitle = `(${points} ${strPoints})`;
  const contextVal = useMemo(() => ({ references: reference }), [reference]);
  return (
    <PartFilesContext.Provider value={contextVal}>
      <div>
        {anonymous || (
          <h3 id={`question-${qnum}-part-${pnum}`}>
            <div className="d-inline-block">
              <HTML value={name} />
            </div>
            <small className="float-right text-muted">
              {subtitle}
            </small>
          </h3>
        )}
        {description?.value && <HTML value={description} />}
        {reference.length !== 0 && (
          <FileViewer
            references={reference}
            refreshProps={refreshCodeMirrorsDeps}
          />
        )}
        {body.map((b, i) => (
          // Body numbers are STATIC.
          // eslint-disable-next-line react/no-array-index-key
          <div className="p-2 bodyitem" key={i}>
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
