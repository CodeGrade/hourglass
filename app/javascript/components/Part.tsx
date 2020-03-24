import React, { useState, useRef, useEffect, useContext } from "react";
import { useExamState } from "./examstate";
import { Code } from "./questions/Code";
import { AllThatApply } from "./questions/AllThatApply"
import { TrueFalse } from "./questions/TrueFalse"
import { YesNo } from "./questions/YesNo"
import { HTML } from "./questions/HTML"
import { MultipleChoice } from "./questions/MultipleChoice"
import { Table } from 'react-bootstrap';
import { isUndefined } from "util";
import { Body } from "./Body";

interface PartProps {
  part: Part;
  qnum: number;
  pnum: number;
}

export function Part(props: PartProps) {
  const { part, qnum, pnum } = props;
  const { name, description, points, body } = part;
  return (
    <div className="row part">
      <h3>Part {pnum + 1}: {name} <small className="float-right text-muted">({points} points)</small></h3>
      <div><HTML value={description} /></div>
      {/* TODO: show files */}
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

