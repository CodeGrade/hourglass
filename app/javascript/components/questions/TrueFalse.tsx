import React from "react";
import { useExamContext, BodyItem, BodyItemProps } from "../examstate";
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

export interface TrueFalse extends BodyItem {
  prompt: Array<string>; // (html)
}

export interface TrueFalseProps extends BodyItemProps {
  prompt: Array<string>; // (html)
  readOnly?: boolean;
}

export function TrueFalse(props: TrueFalseProps) {
  const { prompt, qnum, pnum, bnum, readOnly } = props;
  const { dispatch, examStateByPath } = useExamContext();
  const value = examStateByPath(qnum, pnum, bnum);
  let theRest = null;
  if (readOnly) {
    if (value === undefined) {
      theRest = (<React.Fragment>
        <b>Answer: </b>
        <i>No answer given</i>
      </React.Fragment>);
    } else {
      theRest = (<React.Fragment>
        <b>Answer: </b>
        <span className="btn btn-sm btn-outline-dark disabled">
          {value ? "True" : "False"}
        </span>
      </React.Fragment>)
    }
  } else {
    const handler = val => {
      dispatch({
        type: 'updateAnswer',
        path: [qnum, pnum, bnum],
        val,
      })
    }
    theRest =
      <React.Fragment>
        <ToggleButtonGroup type="radio" name={`tf-${qnum}-${pnum}-${bnum}`} value={value} onChange={handler}>
          <ToggleButton variant="outline-primary" value={true}>True</ToggleButton>
          <ToggleButton variant="outline-primary" value={false}>False</ToggleButton>
        </ToggleButtonGroup>
      </React.Fragment>
  }
  return (
    <div>
      <div>{prompt}</div>
      {theRest}
    </div>
  )
}
