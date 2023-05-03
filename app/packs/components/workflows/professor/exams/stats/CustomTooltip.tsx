import React, {
  RefObject,
} from 'react';
import {
  Card,
} from 'react-bootstrap';
import { PresetUsageData, RechartPayload } from './utils';

const CustomTooltip: React.FC<{
  active?: boolean,
  frozenPayload?: RechartPayload<PresetUsageData>[],
  payload?: RechartPayload<PresetUsageData>[],
  frozenLabel?: string,
  label?: string,
  innerRef?: RefObject<HTMLDivElement>,
  presets: Record<string, {
    readonly points: number,
    readonly graderHint: string,
    readonly studentFeedback: string,
  }>,
  frozenPos?: boolean,
  onClickRow?: (value: RechartPayload<PresetUsageData>) => void,
}> = (props) => {
  const {
    presets,
    active,
    frozenPayload,
    payload: defaultPayload,
    frozenLabel,
    label: defaultLabel,
    innerRef,
    frozenPos,
    onClickRow,
  } = props;
  const payload = frozenPayload ?? defaultPayload;
  const label = frozenLabel ?? defaultLabel;
  if (active && payload?.length) {
    const payload0 = payload[0].payload;
    return (
      <Card
        border={frozenPos ? 'warning' : 'info'}
        className="p-2 mb-0"
        ref={innerRef}
      >
        <p style={{ maxWidth: '25em' }}>
          {label === 'none' ? 'Custom (no preset)' : presets[label]?.studentFeedback ?? presets[label]?.graderHint}
        </p>
        <table className="table table-sm mb-0">
          <tbody>
            {payload.map((value, index) => (
              <tr
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="py-1 my-1"
                onClick={() => onClickRow?.(value)}
              >
                <td style={{ width: '2em', backgroundColor: value.fill }} />
                <td>{value.name}</td>
                <td>{value.value}</td>
              </tr>
            ))}
            <tr>
              <td />
              <td><b>Total</b></td>
              <td>{('Total' in payload0) && payload0.Total}</td>
            </tr>
          </tbody>
        </table>
      </Card>
    );
  }
  return null;
};

export default CustomTooltip;
