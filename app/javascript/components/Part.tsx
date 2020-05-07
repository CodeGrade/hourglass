import React from 'react';
import { Table, Col, Row } from 'react-bootstrap';
import { PartInfo } from '@hourglass/types';
import HTML from '@hourglass/components/HTML';
import { BodyProps } from './Body';
import { FileViewer } from './FileViewer';

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
    <div id={`question-${qnum}-part-${pnum}`} className="part">
      <h3>
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
            <div key={i}>
              <div className="w-100 no-gutters">
                <Row>
                  <Col>
                    <BodyRenderer body={b} qnum={qnum} pnum={pnum} bnum={i} />
                  </Col>
                </Row>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Part;
