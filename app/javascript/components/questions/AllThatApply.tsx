import React from "react";
import { useExamContext } from "../examstate";
import { Form } from 'react-bootstrap';

export interface AllThatApplyProps {
  ata: AllThatApply;
  qnum: number;
  pnum: number;
  bnum: number;
}

export function AllThatApply(props: AllThatApplyProps) {
  const { ata, qnum, pnum, bnum } = props;
  const { options, prompt } = ata;
  const { dispatch, getAtPath } = useExamContext();
  const value = getAtPath(qnum, pnum, bnum);
  // if (readOnly) {
  //   if (!value?.some((ans) => !!ans)) {
  //     theRest = (<React.Fragment>
  //       <b>Answer: </b>
  //       <i>None selected</i>
  //     </React.Fragment>);
  //   } else {
  //     theRest = (<React.Fragment>
  //       <b>Answer: </b>
  //       <ul>
  //         {options.map((o, i) => {
  //           if (value?.[i]) { return <li>{o}</li>; }
  //           else { return null; }
  //         })}
  //       </ul>
  //     </React.Fragment>)
  //   }
  // } else {
  const handler = index => event => {
    const val = event.target.checked;
    dispatch({
      type: 'updateAnswer',
      path: [qnum, pnum, bnum, index],
      val,
    })
  }
  const body =
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
  return (
    <div>
      <div>{prompt}</div>
      {body}
    </div>
  )
}
