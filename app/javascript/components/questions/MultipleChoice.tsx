import React from "react";
import { useExamContext } from "../examstate";
import { Form } from 'react-bootstrap';

export interface MultipleChoiceProps {
  mc: MultipleChoice;
  qnum: number;
  pnum: number;
  bnum: number;
}

export function MultipleChoice(props: MultipleChoiceProps) {
  const { mc, qnum, pnum, bnum } = props;
  const { options, prompt } = mc;
  const { dispatch, getAtPath } = useExamContext();
  const value = getAtPath(qnum, pnum, bnum);
  //if (readOnly) {
  //  if (value === undefined) {
  //    theRest = (<React.Fragment>
  //      <b>Answer: </b>
  //      <i>None selected</i>
  //    </React.Fragment>);
  //  } else {
  //    theRest = (<React.Fragment>
  //      <b>Answer: </b>
  //      <span className="btn btn-sm btn-outline-dark disabled">
  //        {options[value]}
  //      </span>

  //    </React.Fragment>)
  //  }
  //} else {
  const handler = event => {
    const val = event.target.value;
    dispatch({
      type: 'updateAnswer',
      path: [qnum, pnum, bnum],
      val,
    })
  }
  const body =
    <React.Fragment>
      <i>(Select one of the following responses)</i>
      <Form.Group>
      {options.map((o, i) => {
        return <Form.Check type="radio" value={i} label={o} id={`mc-${qnum}-${pnum}-${bnum}-${i}`}
                            onChange={handler} checked={value == i} key={i} />;
      })}
      </Form.Group>
    </React.Fragment>;
  return (
    <div>
      <div>{prompt}</div>
      {body}
    </div>
  )
}
