import React, { useState, useEffect } from 'react';
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
import { pluralize } from '@hourglass/common/helpers';

function describeRemainingTime(remaining: Duration): string {
  const left = remaining.shiftTo('weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds').normalize();
  if (left.weeks > 0) {
    return `${pluralize(left.weeks, 'week', 'weeks')}, ${pluralize(left.days, 'day', 'days')} remaining`;
  }
  if (left.days > 0) {
    return `${pluralize(left.days, 'day', 'days')}, ${pluralize(left.hours, 'hour', 'hours')} remaining`;
  }
  if (left.hours > 0) {
    return `${pluralize(left.hours, 'hour', 'hours')}, ${pluralize(left.minutes, 'minute', 'minutes')} remaining`;
  }
  if (left.minutes > 0) {
    return `${pluralize(left.minutes, 'minute', 'minutes')}, ${pluralize(left.seconds, 'second', 'seconds')} remaining`;
  }
  if (left.valueOf() > 0) {
    return `${pluralize(left.seconds, 'second', 'seconds')} remaining`;
  }
  return 'Exam over';
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
  const [remainingTime, setRemainingTime] = useState(time.stop.diffNow());
  const durationInMillisec = time.stop.diff(time.start).as('milliseconds');
  const cutoffs = [
    { t: Duration.fromMillis(durationInMillisec * 0.50), c: 'bg-info text-light' },
    { t: Duration.fromMillis(durationInMillisec * 0.25), c: 'bg-info text-light' },
    { t: Duration.fromMillis(durationInMillisec * 0.05), c: 'bg-warning text-dark' },
    { t: Duration.fromObject({ minutes: 30 }).shiftTo('milliseconds'), c: 'bg-info text-light' },
    { t: Duration.fromObject({ minutes: 5 }).shiftTo('milliseconds'), c: 'bg-warning text-dark' },
    { t: Duration.fromObject({ minutes: 1 }).shiftTo('milliseconds'), c: 'bg-danger text-light' },
  ].sort((d1, d2) => d1.t.milliseconds - d2.t.milliseconds);
  const remaining = describeRemainingTime(remainingTime);
  const warningIndex = cutoffs.findIndex((cutoff) => {
    const tMinusRemaining = cutoff.t.minus(remainingTime).shiftTo('seconds').seconds;
    return tMinusRemaining >= 0 && tMinusRemaining < 30;
  });
  const classes = warningIndex >= 0 ? cutoffs[warningIndex].c : undefined;
  const [relativeBegan, showRelativeBegan] = useState(true);
  const [relativeEnd, showRelativeEnd] = useState(true);
  const [relativeStart, showRelativeStart] = useState(true);
  const [relativeStop, showRelativeStop] = useState(true);

  useEffect(() => {
    setRemainingTime(time.stop.diffNow());
    const timer = setInterval(() => {
      setRemainingTime(time.stop.diffNow());
    }, 1000);
    return (): void => {
      clearInterval(timer);
    };
  }, [time, openTimer, expanded]);
  const endsLabel = remainingTime.valueOf() > 0 ? 'ends' : 'ended';
  return (
    <Accordion
      className="mt-4"
      activeKey={openTimer}
    >
      <NavAccordionItem
        className={classes}
        expanded={expanded}
        Icon={MdTimer}
        label={remaining}
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
            <tr className="text-muted">
              <td className="align-middle">Exam began:</td>
              <td className="w-100 align-middle">
                <ReadableDate
                  relative={relativeBegan}
                  showTime
                  value={time.began}
                />
              </td>
              <td>
                <Button
                  variant="outline-info"
                  size="sm"
                  className="ml-4"
                  onClick={(): void => showRelativeBegan((b) => !b)}
                >
                  <RenderIcon I={FaClock} />
                </Button>
              </td>
            </tr>
            <tr className="font-weight-bold">
              <td className="align-middle">You started:</td>
              <td className="w-100 align-middle">
                <ReadableDate
                  relative={relativeStart}
                  showTime
                  value={time.start}
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
            <tr className="font-weight-bold">
              <td className="align-middle">{`Your exam ${endsLabel}:`}</td>
              <td className="w-100 align-middle">
                <ReadableDate
                  relative={relativeStop}
                  showTime
                  value={time.stop}
                />
              </td>
              <td>
                <Button
                  variant="outline-info"
                  size="sm"
                  className="ml-4"
                  onClick={(): void => showRelativeStop((b) => !b)}
                >
                  <RenderIcon I={FaClock} />
                </Button>
              </td>
            </tr>
            <tr className="text-muted">
              <td className="align-middle">{`Exam ${endsLabel}:`}</td>
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
                  onClick={(): void => showRelativeEnd((b) => !b)}
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
