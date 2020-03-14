import React from "react";
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
  const { options, prompt, qnum, pnum, bnum, readOnly } = props;
  const { dispatch, examStateByPath } = useExamContext();
  const value = examStateByPath(qnum, pnum, bnum);
  let theRest = null;
  if (readOnly) {
    if (!value?.some((ans) => !!ans)) {
      theRest = (<React.Fragment>
        <b>Answer: </b>
        <i>None selected</i>
      </React.Fragment>);
    } else {
      theRest = (<React.Fragment>
        <b>Answer: </b>
        <ul>
          {options.map((o, i) => {
            if (value?.[i]) { return <li>{o}</li>; }
            else { return null; }
          })}
        </ul>
      </React.Fragment>)
    }
  } else {
    const handler = index => event => {
      const val = event.target.checked;
      dispatch({
        type: 'updateAnswer',
        path: [qnum, pnum, bnum, index],
        val,
      })
    }
    theRest = 
      <React.Fragment>
        <i>(Select all that apply)</i>
        {options.map((o, i) => {
          const val = !!value?.[i];
          return (
            <Form.Group key={i}>
              <Form.Check type="checkbox" label={o} id={`ata-${qnum}-${pnum}-${bnum}-${i}`} checked={val} onChange={handler(i)} />
            </Form.Group>
          );
        })}
      </React.Fragment>;
  }
  return (
    <div>
      <div>{prompt}</div>
      {theRest}
    </div>
  )
}
