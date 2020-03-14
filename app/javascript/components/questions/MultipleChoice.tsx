import React from "react";
import { useExamContext, BodyItem, BodyItemProps } from "../examstate";
import { Form } from 'react-bootstrap';


export interface MultipleChoice extends BodyItem {
  prompt: Array<string>; // (html)
  options: Array<string>; // (html)
}

export interface MultipleChoiceProps extends BodyItemProps {
  prompt: Array<string>; // (html)
  options: Array<string>; // (html)
  readOnly?: boolean;
}

export function MultipleChoice(props: MultipleChoiceProps) {
  const { options, prompt, qnum, pnum, bnum, readOnly } = props;
  const { dispatch, examStateByPath } = useExamContext();
  const value = examStateByPath(qnum, pnum, bnum);
  let theRest = null;
  if (readOnly) {
    if (value === undefined) {
      theRest = (<React.Fragment>
        <b>Answer: </b>
        <i>None selected</i>
      </React.Fragment>);
    } else {
      theRest = (<React.Fragment>
        <b>Answer: </b>
        <span className="btn btn-sm btn-outline-dark disabled">
          {options[value]}
        </span>

      </React.Fragment>)
    }
  } else {
    const handler = event => {
      const val = event.target.value;
      dispatch({
        type: 'updateAnswer',
        path: [qnum, pnum, bnum],
        val,
      })
    }
    theRest = 
      <React.Fragment>
        <i>(Select one of the following responses)</i>
        <Form.Group>
        {options.map((o, i) => {
          return <Form.Check type="radio" value={i} label={o} id={`mc-${qnum}-${pnum}-${bnum}-${i}`} 
                             onChange={handler} checked={value == i} key={i} />;
        })}
        </Form.Group>
      </React.Fragment>;
  }
  return (
    <div>
      <div>{prompt}</div>
      {theRest}
    </div>
  )
}
