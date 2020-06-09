import React from 'react';
import { PartInfo } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import {
  TopScrollspy,
  BottomScrollspy,
} from '@student/exams/show/containers/scrollspy/Part';
import './Part.css';
import Body from '@student/exams/show/components/Body';
import { PartFilesContext } from '../context';

interface PartProps {
  part: PartInfo;
  qnum: number;
  pnum: number;
  anonymous?: boolean;
  separateSubparts: boolean;
  spyQuestion?: (question: number, pnum?: number) => void;
}

const Part: React.FC<PartProps> = (props) => {
  const {
    part,
    qnum,
    pnum,
    anonymous,
    separateSubparts,
    spyQuestion,
  } = props;
  const {
    name = {
      type: 'HTML',
      value: `Part ${pnum + 1}`,
    },
    reference,
    description,
    points,
    body,
  } = part;
  const strPoints = points > 1 || points === 0 ? 'points' : 'point';
  const subtitle = `(${points} ${strPoints})`;
  return (
    <PartFilesContext.Provider value={{ references: reference }}>
      <div
        onFocus={(): void => {
          spyQuestion(qnum, pnum);
        }}
      >
        {anonymous || (
          <TopScrollspy
            question={qnum}
            part={pnum}
            separateSubparts={separateSubparts}
          />
        )}
        {anonymous || (
          <h3 id={`question-${qnum}-part-${pnum}`}>
            <HTML value={name} />
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
            <Body body={b} qnum={qnum} pnum={pnum} bnum={i} />
          </div>
        ))}
        {anonymous || (
          <BottomScrollspy
            question={qnum}
            part={pnum}
            separateSubparts={separateSubparts}
          />
        )}
      </div>
    </PartFilesContext.Provider>
  );
};

export default Part;
