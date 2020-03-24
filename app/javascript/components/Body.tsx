import React from 'react';
import { HTML } from "./questions/HTML"
import { Code } from "./questions/Code";
import { YesNo } from "./questions/YesNo";
import { CodeTag } from "./questions/CodeTag";
import { Text } from "./questions/Text";
import { Matching } from "./questions/Matching";
import { MultipleChoice } from "./questions/MultipleChoice";
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
    case 'CodeTag':
      return <CodeTag codetag={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'TrueFalse':
      return <YesNo yesno={body} qnum={qnum} pnum={pnum} bnum={bnum} yes="True" no="False "/>;
    case 'YesNo':
      return <YesNo yesno={body} qnum={qnum} pnum={pnum} bnum={bnum}/>;
    case 'MultipleChoice':
      return <MultipleChoice mc={body} qnum={qnum} pnum={pnum} bnum={bnum}/>;
    case 'Text':
      return <Text text={body} qnum={qnum} pnum={pnum} bnum={bnum}/>;
    case 'Matching':
      return <Matching matching={body} qnum={qnum} pnum={pnum} bnum={bnum}/>;
    default:
      throw new Error("invalid question type");
  }
}
