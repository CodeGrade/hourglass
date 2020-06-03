import React from 'react';
import { DateTime } from 'luxon';

function makeReadableDate(dd: DateTime, showTime: boolean): string {
  const today = DateTime.local().startOf('day');
  const tomorrow = today.plus({ days: 1 });
  const twodays = tomorrow.plus({ days: 1 });
  if (today <= dd && dd < tomorrow) {
    return `Today at ${dd.toLocaleString(DateTime.TIME_WITH_SECONDS)}`;
  }
  if (tomorrow <= dd && dd < twodays) {
    return `Tomorrow at ${dd.toLocaleString(DateTime.TIME_WITH_SECONDS)}`;
  }
  if (showTime) {
    return dd.toLocaleString(DateTime.DATETIME_MED);
  }
  return dd.toLocaleString(DateTime.DATE_FULL);
}

interface ReadableDateProps {
  value: DateTime;
  relative?: boolean;
  showTime?: boolean;
}

const ReadableDate: React.FC<ReadableDateProps> = (props) => {
  const {
    value,
    relative = false,
    showTime = false,
  } = props;
  const str = relative ? value.toRelative() : makeReadableDate(value, showTime);
  return (
    <>{str}</>
  );
};

export default ReadableDate;
