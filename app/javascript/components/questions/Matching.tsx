import React from 'react';
import {
  Row, Col, Table,
} from 'react-bootstrap';
import {
  Select, FormControl, InputLabel, MenuItem,
} from '@material-ui/core';
import { MatchingInfo, MatchingState } from '@hourglass/types';

interface MatchingProps {
  info: MatchingInfo;
  value: MatchingState;
  onChange: (index: number, newVal: number) => void;
  disabled: boolean;
}

const Matching: React.FC<MatchingProps> = (props) => {
  const {
    info,
    value,
    onChange,
    disabled,
  } = props;
  const {
    promptLabel, prompts, valuesLabel, values,
  } = info;
  return (
    <Row>
      <Col sm={6}>
        <Table>
          <thead>
            <tr>
              <th colSpan={3}>
                <p>{promptLabel ?? 'Column A'}</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {prompts.map((p, i) => {
              const valueI = value?.[i] ?? -1;
              const handleChange = (event) => {
                const val = event.target.value;
                onChange(i, val);
              };
              return (
                <tr key={i}>
                  <td>
                    {String.fromCharCode(65 + i)}
                    .
                  </td>
                  <td>{p}</td>
                  <td>
                    <FormControl variant="outlined">
                      <InputLabel>Match</InputLabel>
                      <Select
                        disabled={disabled}
                        margin="dense"
                        value={valueI}
                        onChange={handleChange}
                        label="Match"
                      >
                        <MenuItem value={-1}>
                          <em>None</em>
                        </MenuItem>
                        {(values.map((v, j) => (
                          <MenuItem
                            key={j}
                            value={j + 1}
                          >
                            {j + 1}
                          </MenuItem>
                        )))}
                      </Select>
                    </FormControl>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Col>
      <Col sm={6}>
        <Table>
          <thead>
            <tr>
              <th colSpan={3}>
                <p>{valuesLabel ?? 'Column B'}</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {values.map((v, i) => (
              <tr key={i}>
                <td>
                  {i + 1}
                  .
                </td>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Col>
    </Row>
  );
};

export default Matching;
