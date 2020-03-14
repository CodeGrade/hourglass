import React, { useState, useRef, useEffect, useContext } from "react";
import { useExamState, BodyItem, BodyItemProps, ExamContext, FileDir } from "./examstate";
import { AllThatApply } from "./questions/AllThatApply"
import { TrueFalse } from "./questions/TrueFalse"
import { YesNo } from "./questions/YesNo"
import { HTML } from "./questions/HTML"
import { MultipleChoice } from "./questions/MultipleChoice"
import { Table } from 'react-bootstrap';
import { isUndefined } from "util";

export interface Part {
  name?: string;
  description: string;
  points: number;
  reference?: Array<FileDir>;
  body: Array<BodyItem>;
}

export interface PartProps extends Part {
  qnum: number;
  pnum: number;
}

export function Part(props: PartProps) {
  const { name, description, points, qnum, pnum, body } = props;
  return (
    <div className="row part">
      <h3>Part {pnum + 1}: {name} <small className="float-right text-muted">({points} points)</small></h3>
      <div><HTML value={description} /></div>
      {/* TODO: show files */}
      <Table hover borderless>
        <tbody>
          {body.map((b, i) => {
            let bodyItem = null;
            let className = "";
            switch (b.type) {
              case 'HTML':
                className = "no-hover";
                bodyItem = <HTML value={(b as HTML).value}/>;
                break;
              case 'AllThatApply':
                bodyItem = <AllThatApply {...(b as AllThatApply)} qnum={qnum} pnum={pnum} bnum={i}/>;
                break;
              case "TrueFalse":
                bodyItem = <TrueFalse {...(b as TrueFalse)} qnum={qnum} pnum={pnum} bnum={i}/>;
                break;
              case "YesNo":
                bodyItem = <YesNo {...(b as YesNo)} qnum={qnum} pnum={pnum} bnum={i}/>;
                break;
              case "MultipleChoice":
                bodyItem = <MultipleChoice {...(b as MultipleChoice)} qnum={qnum} pnum={pnum} bnum={i}/>;
                break;
              default:
                bodyItem = <p key={i}>Something more complicated.</p>;
                break;
            }
            return <tr className={className} key={i}><td className="row no-gutters">{bodyItem}</td></tr>;
          })}
        </tbody>
      </Table>
    </div>
  )
}

