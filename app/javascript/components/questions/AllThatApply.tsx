import React, { useReducer } from "react";
import { useExamContext, BodyItem, BodyItemProps } from "../examstate";
import { Form } from 'react-bootstrap';


export interface AllThatApply extends BodyItem {
  prompt: Array<string>; // (html)
  options: Array<string>; // (html)
}

export interface AllThatApplyProps extends BodyItemProps {
  prompt: Array<string>; // (html)
  options: Array<string>; // (html)
  readOnly?: boolean;
}

export function AllThatApply(props: AllThatApplyProps) {
  const { options, qnum, pnum, bnum, readOnly } = props;
  const { dispatch, examStateByPath } = useExamContext();
  const value = examStateByPath(qnum, pnum, bnum);
  if (readOnly) {
    if (!value?.some((ans) => !!ans)) {
      return (<React.Fragment>
        <b>Answer: </b>
        <i>None selected</i>
      </React.Fragment>);
    } else {
      return (<React.Fragment>
        <b>Answer: </b>
        <ul>
          {options.map((o, i) => {
            if (value?.[i]) { return <li>{o}</li>; }
            else { return null; }
          })}
        </ul>
      </React.Fragment>)
    }
  }
  const handler = index => event => {
    const val = event.target.checked;
    dispatch({
      type: 'updateAnswer',
      path: [qnum, pnum, bnum, index],
      val,
    })
  }
  return (
    <div>
      <i>(Select all that apply)</i>
      {options.map((o, i) => {
        const val = !!value?.[i];
        return (
          <Form.Group key={i}>
            <Form.Check type="checkbox" label={o} id={`ata-${qnum}-${pnum}-${bnum}-${i}`} checked={val} onChange={handler(i)} />
          </Form.Group>
        );
      })}
    </div>
  )
}
