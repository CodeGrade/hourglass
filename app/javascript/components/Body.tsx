import React from 'react';
import { HTML } from "./questions/HTML"
import { Code } from "./questions/Code";
import { AllThatApply } from "./questions/AllThatApply";

export interface BodyProps {
  body: BodyItem;
  qnum: number;
  pnum: number;
  bnum: number;
}

export function Body(props: BodyProps) {
  const { body, qnum, pnum, bnum } = props;
  switch (body.type) {
    case 'HTML':
      return <HTML value={body.value} />;
    case 'Code':
      return <Code code={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'AllThatApply':
      return <AllThatApply ata={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
    // case 'TrueFalse':
    //   bodyItem = <TrueFalse {...(b as TrueFalse)} qnum={qnum} pnum={pnum} bnum={i}/>;
    //   break;
    // case 'YesNo':
    //   bodyItem = <YesNo {...(b as YesNo)} qnum={qnum} pnum={pnum} bnum={i}/>;
    //   break;
    // case 'MultipleChoice':
    //   bodyItem = <MultipleChoice {...(b as MultipleChoice)} qnum={qnum} pnum={pnum} bnum={i}/>;
    //   break;
    default:
      return <p>Something more complicated.</p>;
  }
}
