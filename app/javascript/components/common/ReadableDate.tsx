import React from 'react';
import { DateTime, Duration } from 'luxon';

function makeReadableDate(dd: DateTime, showTime: boolean, capitalize: boolean): string {
  const today = DateTime.local().startOf('day');
  const yesterday = today.minus({ days: 1 });
  const tomorrow = today.plus({ days: 1 });
  const twodays = tomorrow.plus({ days: 1 });
  let relDay: string;
  if (yesterday <= dd && dd < today) {
    relDay = (capitalize ? 'Yesterday' : 'yesterday');
  } else if (today <= dd && dd < tomorrow) {
    relDay = (capitalize ? 'Today' : 'today');
  } else if (tomorrow <= dd && dd < twodays) {
    relDay = (capitalize ? 'Tomorrow' : 'tomorrow');
  }
  if (relDay !== undefined) {
    return `${relDay} at ${dd.toLocaleString(DateTime.TIME_WITH_SECONDS)}`;
  }
  if (showTime) {
    return dd.toLocaleString(DateTime.DATETIME_MED);
  }
  return dd.toLocaleString(DateTime.DATE_FULL);
}

interface ReadableDateProps {
  className?: string;
  value: DateTime;
  relative?: boolean;
  showTime?: boolean;
  threshold?: Duration;
  capitalize?: boolean;
}

const ReadableDate: React.FC<ReadableDateProps> = (props) => {
  const {
    value,
    relative = false,
    showTime = false,
    className,
    capitalize,
  } = props;
  let str: string;
  if (relative) {
    str = value.toRelative();
  } else {
    str = makeReadableDate(value, showTime, capitalize);
  }
  return (
    <span className={className}>{str}</span>
  );
};

export default ReadableDate;
