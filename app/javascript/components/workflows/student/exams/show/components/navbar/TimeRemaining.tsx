import React, { useState } from 'react';
import { Duration } from 'luxon';
import { TimeInfo } from '@student/exams/show/types';
import ReadableDate from '@hourglass/common/ReadableDate';
import { FaClock } from 'react-icons/fa';
import { MdTimer } from 'react-icons/md';
import RenderIcon from '@student/exams/show/components/Icon';
import {
  Accordion,
  Button,
  Table,
} from 'react-bootstrap';
import NavAccordionItem from '@student/exams/show/components/navbar/NavAccordionItem';

function pluralize(number: number, singular: string, plural: string): string {
  if (number === 0) {
    return `${number} ${plural}`;
  }
  if (number === 1) {
    return `${number} ${singular}`;
  }
  return `${number} ${plural}`;
}

function describeRemainingTime(remaining: Duration): string {
  const left = remaining.shiftTo('weeks', 'days', 'hours', 'minutes', 'seconds').normalize();
  if (left.weeks > 0) {
    return `${pluralize(left.weeks, 'week', 'weeks')}, ${pluralize(left.days, 'day', 'days')}`;
  }
  if (left.days > 0) {
    return `${pluralize(left.days, 'day', 'days')}, ${pluralize(left.hours, 'hour', 'hours')}`;
  }
  if (left.hours > 0) {
    return `${pluralize(left.hours, 'hour', 'hours')}, ${pluralize(left.minutes, 'minute', 'minutes')}`;
  }
  return pluralize(left.minutes, 'minute', 'minute');
}

export interface TimeRemainingProps {
  time: TimeInfo;
  openTimer: string;
  setOpenTimer: React.Dispatch<React.SetStateAction<string>>;
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const TimeRemaining: React.FC<TimeRemainingProps> = (props) => {
  const {
    time,
    openTimer,
    setOpenTimer,
    expanded,
    setExpanded,
  } = props;
  const durationInMillisec = time.ends.diff(time.began).as('milliseconds');
  const cutoffs = [
    { t: Duration.fromMillis(durationInMillisec * 0.50), c: 'bg-info' },
    { t: Duration.fromMillis(durationInMillisec * 0.25), c: 'bg-info' },
    { t: Duration.fromMillis(durationInMillisec * 0.05), c: 'bg-warning' },
    { t: Duration.fromObject({ minutes: 30 }).shiftTo('milliseconds'), c: 'bg-info' },
    { t: Duration.fromObject({ minutes: 5 }).shiftTo('milliseconds'), c: 'bg-warning' },
    { t: Duration.fromObject({ minutes: 1 }).shiftTo('milliseconds'), c: 'bg-danger' },
  ].sort((d1, d2) => d1.t.milliseconds - d2.t.milliseconds);

  const remainingTime = time.ends.diffNow();
  const remaining = describeRemainingTime(remainingTime);
  const warningIndex = cutoffs.findIndex((cutoff) => {
    const tMinusRemaining = cutoff.t.minus(remainingTime).shiftTo('seconds').seconds;
    return tMinusRemaining > 0 && tMinusRemaining < 30;
  });
  const classes = warningIndex >= 0 ? `${cutoffs[warningIndex].c} text-dark` : undefined;
  const [relativeStart, showRelativeStart] = useState(true);
  const [relativeEnd, setExactEnd] = useState(true);


  return (
    <Accordion
      className="mt-4"
      activeKey={openTimer}
    >
      <NavAccordionItem
        className={classes}
        expanded={expanded}
        Icon={MdTimer}
        label={`${remaining} remaining`}
        eventKey="time"
        onSectionClick={(eventKey): void => {
          if (expanded) {
            if (openTimer === eventKey) {
              setOpenTimer('');
            } else {
              setOpenTimer(eventKey);
            }
          } else {
            setExpanded(true);
            setOpenTimer(eventKey);
          }
        }}
        direction="up"
      >
        <Table size="sm" borderless className="mb-0">
          <tbody>
            <tr>
              <td className="align-middle">Exam began:</td>
              <td className="w-100 align-middle">
                <ReadableDate
                  relative={relativeStart}
                  value={time.began}
                />
              </td>
              <td>
                <Button
                  variant="outline-info"
                  size="sm"
                  className="ml-4"
                  onClick={(): void => showRelativeStart((b) => !b)}
                >
                  <RenderIcon I={FaClock} />
                </Button>
              </td>
            </tr>
            <tr>
              <td className="align-middle">Exam ends:</td>
              <td className="w-100 align-middle">
                <ReadableDate
                  relative={relativeEnd}
                  showTime
                  value={time.ends}
                />
              </td>
              <td>
                <Button
                  variant="outline-info"
                  size="sm"
                  className="ml-4"
                  onClick={(): void => setExactEnd((b) => !b)}
                >
                  <RenderIcon I={FaClock} />
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>
      </NavAccordionItem>
    </Accordion>
  );
};

export default TimeRemaining;
