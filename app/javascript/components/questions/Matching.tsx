import React from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { Select, FormControl, InputLabel, MenuItem } from '@material-ui/core';
import { Matching } from '../../types';

interface MatchingProps {
  info: Matching;
  qnum: number;
  pnum: number;
  bnum: number;
}

// TODO: move state to redux
export function Matching(props: MatchingProps) {
  const { info, qnum, pnum, bnum } = props;
  const { promptLabel, prompts, valuesLabel, values } = info;
  return (
    <Container>
      <Row>
        <Col sm={6}>
          <Table>
            <thead>
              <tr>
                <th></th>
                <th>
                  <p>{promptLabel ?? "Column A"}</p>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {prompts.map((p, i) => {
                const [answerI, setAnswerI] = React.useState('');

                const handleChange = (event) => {
                  setAnswerI(event.target.value);
                };              
                return <tr key={`${qnum}-${pnum}-${bnum}-prompt-${i}`}>
                  <td>{String.fromCharCode(65 + i)}.</td>
                  <td>{p}</td>
                  <td>
                    <FormControl variant="outlined">
                      <InputLabel id={`${qnum}-${pnum}-${bnum}-answer-${i}`}>Match</InputLabel>
                      <Select
                        margin="dense"
                        labelId={`${qnum}-${pnum}-${bnum}-answer-${i}`}
                        value={answerI}
                        onChange={handleChange}
                        label="Match"
                      >
                        {/* <MenuItem value="">
                          <em>None</em>
                        </MenuItem> */}
                        {(values.map((v, j) => {
                          return <MenuItem key={`${qnum}-${pnum}-${bnum}-${i}-${j}`} value={j + 1}>{j + 1}</MenuItem>;
                        }))}
                      </Select>
                    </FormControl>
                  </td>
                </tr>
              })}
            </tbody>
          </Table>
        </Col>
        <Col sm={6}>
        <Table>
            <thead>
              <tr>
                <th></th>
                <th>
                  <p>{valuesLabel ?? "Column B"}</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {values.map((v, i) => {
                return <tr key={`${qnum}-${pnum}-${bnum}-value-${i}`}>
                  <td>{i + 1}.</td>
                  <td>{v}</td>
                </tr>
              })}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}
