import React from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { YesNoInfo } from '../../types';

export interface YesNoProps {
  info: YesNoInfo;
  yesLabel?: string;
  noLabel?: string;
  value: boolean;
  onChange: (newValue: boolean) => void;
  qnum: number;
  pnum: number;
  bnum: number;
}

export function YesNoInput(props: YesNoProps) {
  const {
    qnum, pnum, bnum, info, yesLabel, noLabel, value, onChange,
  } = props;
  const { prompt } = info;
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
  return (
    <div>
      <div>{prompt}</div>
      <ToggleButtonGroup
        name={`tf-${qnum}-${pnum}-${bnum}`}
        type="radio"
        value={value}
        onChange={onChange}
      >
        <ToggleButton variant="outline-primary" value>{yesLabel || 'Yes'}</ToggleButton>
        <ToggleButton variant="outline-primary" value={false}>{noLabel || 'No'}</ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}
