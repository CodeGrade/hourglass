import React, { useState } from 'react';
import {
  InputGroup,
  ListGroup,
  Dropdown,
} from 'react-bootstrap';
import { BsCalendar } from 'react-icons/bs';
import DatePicker from 'react-datepicker';
import TimePicker from 'react-timekeeper';
import { DateTime } from 'luxon';
import 'react-datepicker/dist/react-datepicker.css';
import './DateTimePicker.scss';

interface DateTimeProps {
  value?: DateTime;
  minValue?: DateTime;
  maxValue?: DateTime;
  onChange?: (newVal: DateTime) => void;
}

function mergeDateTime(date: DateTime, time: DateTime): DateTime {
  return DateTime.fromObject({
    ...date.toObject(),
    hour: time.hour,
    minute: time.minute,
    second: time.second,
    zone: time.zone,
  });
}

const timeZones = {
  'America/New_York': 'East Coast, USA',
  'Europe/London': 'London, UK',
  'America/Los_Angeles': 'West Coast, USA',
  'America/Toronto': 'Toronto, CA',
};

const DateTimePicker: React.FC<DateTimeProps> = (props) => {
  const {
    value,
    minValue,
    maxValue,
    onChange,
  } = props;
  const [timeZone, setTimeZone] = useState(value.zoneName in timeZones ? value.zoneName : 'UTC');
  return (
    <InputGroup className="w-100 d-flex">
      <InputGroup.Text className="d-flex flex-grow-1">
        {value.toLocaleString({
          ...DateTime.DATETIME_HUGE,
          timeZone,
          timeZoneName: 'short',
        })}
      </InputGroup.Text>
      <Dropdown
        as={InputGroup.Append}
      >
        <Dropdown.Toggle id="choose-time">
          <BsCalendar />
        </Dropdown.Toggle>
        <Dropdown.Menu className="p-0 d-flex flex-grow-1 DateTimeCustom">
          <DatePicker
            inline
            selected={value.toJSDate()}
            calendarClassName="NestedDatePicker"
            minDate={minValue?.toJSDate()}
            maxDate={maxValue?.toJSDate()}
            onChange={(date, _event): void => {
              if (onChange) {
                onChange(mergeDateTime(DateTime.fromJSDate(date), value));
              }
            }}
          />
          <TimePicker
            time={value.toFormat('hh:mm a')}
            onChange={(time): void => {
              if (onChange) {
                onChange(mergeDateTime(
                  value,
                  DateTime.fromObject({
                    hour: time.hour,
                    minute: time.minute,
                    zone: value.zone,
                  }),
                ));
              }
            }}
          />
          <div className="TimezonePicker">
            <div>
              <ListGroup as="ul" variant="flush">
                {Object.keys(timeZones).map((tzName) => (
                  <ListGroup.Item
                    as="li"
                    key={tzName}
                    active={timeZone === tzName}
                    action
                    onClick={(): void => {
                      setTimeZone(tzName);
                      if (onChange) {
                        onChange(value.setZone(tzName, { keepLocalTime: true }));
                      }
                    }}
                  >
                    {timeZones[tzName]}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </InputGroup>
  );
};

export default DateTimePicker;
