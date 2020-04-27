import React from "react";
import { Form } from 'react-bootstrap';

import { AllThatApply, AllThatApplyState } from '../../types';

interface AllThatApplyProps {
  info: AllThatApply;
  value: AllThatApplyState;
  onChange: (index: number, newState: boolean) => void;
}

export function AllThatApply(props: AllThatApplyProps) {
  const { onChange, info, value } = props;
  const { options, prompt } = info;
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
    onChange(index, val);
  }
  const body =
    <React.Fragment>
      <i>(Select all that apply)</i>
      {options.map((o, i) => {
        const val = !!value?.[i];
        return (
          <Form.Group key={i}>
            <Form.Check
              type="checkbox"
              label={o}
              checked={val}
              onChange={handler(i)}
            />
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
