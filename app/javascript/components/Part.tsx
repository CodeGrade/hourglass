import React from "react";
import { Table } from 'react-bootstrap';
import { Body } from "./Body";
import { HTML } from "./questions/HTML";
import { FileViewer } from './FileViewer';

interface PartProps {
  part: Part;
  qnum: number;
  pnum: number;
}

export function Part(props: PartProps) {
  const { part, qnum, pnum } = props;
  const { name, reference, description, points, body } = part;
  return (
    <div className="part">
      <h3>Part {pnum + 1}: {name} <small className="float-right text-muted">({points} points)</small></h3>
      <div><HTML value={description} /></div>
      <FileViewer references={reference}/>
      <Table hover borderless>
        <tbody>
          {body.map((b, i) => {
            return (
              <tr key={i}>
                <td className="row no-gutters">
                  <Body body={b} qnum={qnum} pnum={pnum} bnum={i} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  )
}

