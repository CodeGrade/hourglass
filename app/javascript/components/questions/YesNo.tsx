import React from "react";
import { useExamContext } from "../examstate";
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

export interface YesNoProps {
  yesno: YesNo;
  yes?: string;
  no?: string;
  qnum: number;
  pnum: number;
  bnum: number;
}

export function YesNo(props: YesNoProps) {
  const { yesno, qnum, pnum, bnum, yes, no } = props;
  const { prompt } = yesno;
  const { dispatch, getAtPath } = useExamContext();
  const value = getAtPath(qnum, pnum, bnum);
  // if (readOnly) {
  //   if (value === undefined) {
  //     theRest = (<React.Fragment>
  //       <b>Answer: </b>
  //       <i>No answer given</i>
  //     </React.Fragment>);
  //   } else {
  //     theRest = (<React.Fragment>
  //       <b>Answer: </b>
  //       <span className="btn btn-sm btn-outline-dark disabled">
  //         {value ? "Yes" : "No"}
  //       </span>
  //     </React.Fragment>)
  //   }
  // } else {
  const handler = val => {
    dispatch({
      type: 'updateAnswer',
      path: [qnum, pnum, bnum],
      val,
    })
  }
  const body =
    <React.Fragment>
      <ToggleButtonGroup type="radio" name={`tf-${qnum}-${pnum}-${bnum}`} value={value} onChange={handler}>
        <ToggleButton variant="outline-primary" value={true}>{yes || "Yes"}</ToggleButton>
        <ToggleButton variant="outline-primary" value={false}>{no || "No"}</ToggleButton>
      </ToggleButtonGroup>
    </React.Fragment>;
  return (
    <div>
      <div>{prompt}</div>
      {body}
    </div>
  )
}
