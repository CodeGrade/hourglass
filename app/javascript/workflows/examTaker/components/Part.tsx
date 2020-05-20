import React from 'react';
import { PartInfo } from '@examTaker/types';
import HTML from '@examTaker/components/HTML';
import { FileViewer } from '@examTaker/components/FileViewer';
import {
  TopScrollspy,
  BottomScrollspy,
} from '@examTaker/containers/scrollspy/Part';
import './Part.css';
import Body from '@examTaker/components/Body';
import DisplayBody from '@examTaker/components/DisplayBody';

interface PartProps {
  part: PartInfo;
  qnum: number;
  pnum: number;
  anonymous?: boolean;
  separateSubparts: boolean;
  displayOnly?: boolean;
  spyQuestion?: (question: number, pnum?: number) => void;
}

const Part: React.FC<PartProps> = (props) => {
  const {
    part,
    qnum,
    pnum,
    anonymous,
    separateSubparts,
    displayOnly = false,
    spyQuestion,
  } = props;
  const {
    name,
    reference,
    description,
    points,
    body,
  } = part;
  const BodyRenderer = displayOnly ? DisplayBody : Body;
  let title = `Part ${pnum + 1}`;
  if (name) title += `: ${name}`;
  const strPoints = points > 1 || points === 0 ? 'points' : 'point';
  const subtitle = `(${points} ${strPoints})`;
  return (
    <div
      onFocus={(): void => {
        if (!displayOnly) spyQuestion(qnum, pnum);
      }}
    >
      {displayOnly || anonymous || (
        <TopScrollspy
          question={qnum}
          part={pnum}
          separateSubparts={separateSubparts}
        />
      )}
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
          <BodyRenderer body={b} qnum={qnum} pnum={pnum} bnum={i} />
        </div>
      ))}
      {displayOnly || anonymous || (
        <BottomScrollspy
          question={qnum}
          part={pnum}
          separateSubparts={separateSubparts}
        />
      )}
    </div>
  );
};

export default Part;
