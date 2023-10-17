import React, { useState } from 'react';
import {
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import { DateTime } from 'luxon';
import { GrLink, GrUnlink } from 'react-icons/gr';
import { BsArrow90DegLeft } from 'react-icons/bs';
import Icon from '@student/exams/show/components/Icon';
import TooltipButton from '@student/exams/show/components/TooltipButton';
import DateTimePicker from '@professor/exams/new/DateTimePicker';
import ReadableDate from '@hourglass/common/ReadableDate';
import { NumericInput } from '@hourglass/common/NumericInput';

export const ExamTimesViewer: React.FC<{
  startTime?: DateTime,
  endTime?: DateTime,
  duration?: number,
  placeholder?: string,
}> = (props) => {
  const {
    startTime,
    endTime,
    duration,
    placeholder,
  } = props;
  return (
    <>
      <Row className="align-items-center">
        <Form.Label column sm={2}>Starts:</Form.Label>
        {startTime ? <ReadableDate value={startTime} showTime /> : placeholder}
      </Row>
      <Row className="align-items-center">
        <Form.Label column sm={2}>Ends:</Form.Label>
        {endTime ? <ReadableDate value={endTime} showTime /> : placeholder}
      </Row>
      <Row className="align-items-center">
        <Form.Label column sm={2}>Duration:</Form.Label>
        {duration !== null ? `${duration / 60.0} minutes` : placeholder}
      </Row>
    </>
  );
};
export const ExamTimesEditor: React.FC<{
  disabled?: boolean,
  start: DateTime,
  setStart: (s: DateTime) => void,
  end: DateTime,
  setEnd: (e: DateTime) => void,
  duration: number | string,
  setDuration: (d: number | string) => void,
  unsetPlaceholder?: string,
}> = (props) => {
  const {
    disabled,
    start, setStart,
    end, setEnd,
    duration, setDuration,
    unsetPlaceholder,
  } = props;
  const [linked, setLinked] = useState<boolean>(true);
  return (
    <>
      <Form.Group as={Row} className="mb-3">
        <Col className="pr-0" sm={2}>
          <Form.Group as={Row} controlId="examStartTime" className="align-items-center">
            <Form.Label column>Start time:</Form.Label>
          </Form.Group>
          <Form.Group as={Row} controlId="examEndTime" className="align-items-center mb-0">
            <Form.Label column>End time:</Form.Label>
          </Form.Group>
        </Col>
        <Col className="pr-0">
          <Form.Group as={Row} controlId="examStartTime" className="align-items-center">
            <Col>
              <DateTimePicker
                disabled={disabled}
                value={start}
                maxValue={linked ? undefined : end}
                onChange={(newVal) => {
                  if (linked) {
                    setEnd(newVal.plus(end.diff(start)));
                    setStart(newVal);
                  } else {
                    const curDuration = { minutes: Number(duration) || 0 };
                    const maxStartTime = end.minus(curDuration);
                    setStart(newVal <= maxStartTime ? newVal : maxStartTime);
                  }
                }}
                unsetPlaceholder={unsetPlaceholder}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="examEndTime" className="align-items-center mb-0">
            <Col>
              <DateTimePicker
                disabled={disabled}
                value={end}
                minValue={linked ? undefined : start}
                onChange={(newVal) => {
                  if (linked) {
                    setStart(newVal.minus(end.diff(start)));
                    setEnd(newVal);
                  } else {
                    const curDuration = { minutes: Number(duration) || 0 };
                    const minEndTime = start.plus(curDuration);
                    setEnd(newVal >= minEndTime ? newVal : minEndTime);
                  }
                }}
                unsetPlaceholder={unsetPlaceholder}
              />
            </Col>
          </Form.Group>
        </Col>
        <Col sm="auto" className="pl-0 pr-2 d-flex flex-column justify-content-center">
          <Icon I={BsArrow90DegLeft} size="1.25em" />
          <TooltipButton
            variant="link"
            disabled={false}
            className="ml-1 p-0 rotate-45"
            enabledMessage={linked ? 'Start and end times are linked' : 'Start and end times are independent'}
            onClick={() => setLinked(!linked)}
          >
            <Icon I={linked ? GrLink : GrUnlink} />
          </TooltipButton>
          <span style={{ transform: 'scaleY(-1)' }}><Icon I={BsArrow90DegLeft} size="1.25em" /></span>
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId="examDuration" className="align-items-center my-0">
        <Form.Label column sm={2}>Duration (minutes):</Form.Label>
        <Col>
          <NumericInput
            disabled={disabled}
            value={Number(duration) || 0}
            className="overflow-visible"
            variant="primary"
            min={0}
            max={linked ? undefined : end.diff(start).as('minutes')}
            onChange={(newVal) => {
              const numNewVal = Number(newVal) || 0;
              if (linked) {
                setDuration(numNewVal);
                if (start.plus({ minutes: numNewVal }) > end) {
                  setEnd(start.plus({ minutes: numNewVal }));
                }
              } else {
                const availTime = end.diff(start).as('minutes');
                setDuration(Math.min(newVal, availTime));
              }
            }}
          />
        </Col>
      </Form.Group>
    </>
  );
};
