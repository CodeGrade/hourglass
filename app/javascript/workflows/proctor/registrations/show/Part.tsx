import React from 'react';
import { PartInfo } from '@student/types';
import HTML from '@student/components/HTML';
import { FileViewer } from '@student/components/FileViewer';
import DisplayBody from '@proctor/registrations/show/DisplayBody';
import '@student/components/Part.css';

interface PartProps {
  part: PartInfo;
  qnum: number;
  pnum: number;
  anonymous?: boolean;
}

const Part: React.FC<PartProps> = (props) => {
  const {
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
  let title = `Part ${pnum + 1}`;
  if (name) title += `: ${name}`;
  const strPoints = points > 1 || points === 0 ? 'points' : 'point';
  const subtitle = `(${points} ${strPoints})`;
  return (
    <div>
      {anonymous || (
        <h3 id={`question-${qnum}-part-${pnum}`}>
          {title}
          <small className="float-right text-muted">
            {subtitle}
          </small>
        </h3>
      )}
      <div><HTML value={description} /></div>
      {reference && <FileViewer references={reference} />}
      {body.map((b, i) => (
        // Body numbers are STATIC.
        // eslint-disable-next-line react/no-array-index-key
        <div className="p-2 bodyitem" key={i}>
          <DisplayBody body={b} qnum={qnum} pnum={pnum} bnum={i} />
        </div>
      ))}
    </div>
  );
};

export default Part;
