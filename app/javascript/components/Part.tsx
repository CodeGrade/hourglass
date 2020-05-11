import React from 'react';
import { PartInfo } from '@hourglass/types';
import HTML from '@hourglass/components/HTML';
import {
  ScrollspyTop,
  ScrollspyBottom,
} from '@hourglass/containers/Scrollspy';
import { BodyProps } from './Body';
import { FileViewer } from './FileViewer';
import './Part.css';

interface PartProps {
  part: PartInfo;
  qnum: number;
  pnum: number;
  BodyRenderer: React.ComponentType<BodyProps>;
}

const Part: React.FC<PartProps> = (props) => {
  const {
    part,
    qnum,
    pnum,
    BodyRenderer,
  } = props;
  const {
    name, reference, description, points, body,
  } = part;
  let title = `Part ${pnum + 1}`;
  if (name) title += `: ${name}`;
  const subtitle = `(${points} points)`;
  return (
    <div className="part">
      <ScrollspyTop
        qnum={qnum}
        pnum={pnum}
      />
      <h3 id={`question-${qnum}-part-${pnum}`}>
        {title}
        <small className="float-right text-muted">
          {subtitle}
        </small>
      </h3>
      <div><HTML value={description} /></div>
      {reference && <FileViewer references={reference} />}
      <div>
        <div>
          {body.map((b, i) => (
            // Body numbers are STATIC.
            // eslint-disable-next-line react/no-array-index-key
            <div className="p-2 bodyitem" key={i}>
              <BodyRenderer body={b} qnum={qnum} pnum={pnum} bnum={i} />
            </div>
          ))}
        </div>
      </div>
      <ScrollspyBottom
        qnum={qnum}
        pnum={pnum}
      />
    </div>
  );
};

export default Part;
