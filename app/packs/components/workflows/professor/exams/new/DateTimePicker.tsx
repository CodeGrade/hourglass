import React from 'react';
import {
  Form,
  InputGroup,
  ListGroup,
  Dropdown,
  Button,
} from 'react-bootstrap';
import { BsCalendar } from 'react-icons/bs';
import DatePicker from 'react-datepicker';
import TimePicker from 'react-timekeeper';
import { DateTime } from 'luxon';
import Icon from '@student/exams/show/components/Icon';
import { FaTimes } from 'react-icons/fa';
import './DateTimePicker.scss';

interface DateTimeProps {
  disabled?: boolean;
  value?: DateTime;
  minValue?: DateTime;
  maxValue?: DateTime;
  onChange: (newVal: DateTime) => void;
  nullable?: boolean;
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
  UTC: 'UTC',
  'America/New_York': 'East Coast, USA',
  'Europe/London': 'London, UK',
  'America/Los_Angeles': 'West Coast, USA',
  'America/Toronto': 'Toronto, CA',
};

const DateTimePicker: React.FC<DateTimeProps> = (props) => {
  const {
    disabled = false,
    value,
    minValue,
    maxValue,
    onChange,
    nullable = false,
  } = props;
  const timeZone = value?.zoneName ?? 'UTC';
  return (
    <InputGroup className="w-100 d-flex">
      <Form.Control
        disabled
        value={value?.toLocaleString({
          ...DateTime.DATETIME_SHORT,
          timeZone,
          timeZoneName: 'short',
        }) ?? 'Not set.'}
      />
      {value && nullable && (
        <InputGroup.Append>
          <Button
            disabled={disabled}
            size="sm"
            variant="link"
            className="text-dark border"
            onClick={() => onChange(undefined)}
          >
            <Icon I={FaTimes} />
          </Button>
        </InputGroup.Append>
      )}
      <Dropdown
        as={InputGroup.Append}
      >
        <Dropdown.Toggle
          id="choose-time"
          disabled={disabled}
        >
          <BsCalendar />
        </Dropdown.Toggle>
        <Dropdown.Menu
          alignRight
          className="p-0 d-flex flex-grow-1 DateTimeCustom"
        >
          <DatePicker
            disabled={disabled}
            inline
            selected={value?.toJSDate()}
            calendarClassName="NestedDatePicker"
            minDate={minValue?.toJSDate()}
            maxDate={maxValue?.toJSDate()}
            onChange={(date, _event): void => {
              if (onChange) {
                onChange(mergeDateTime(DateTime.fromJSDate(date), value ?? DateTime.local()));
              }
            }}
          />
          <TimePicker
            time={value?.toFormat('hh:mm a')}
            onChange={(time): void => {
              if (disabled) return;
              if (onChange) {
                onChange(mergeDateTime(
                  value ?? DateTime.local(),
                  DateTime.fromObject({
                    hour: time.hour,
                    minute: time.minute,
                    zone: (value ?? DateTime.local()).zone,
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
                      if (disabled) return;
                      if (onChange) {
                        onChange(
                          (value ?? DateTime.local()).setZone(tzName, { keepLocalTime: true }),
                        );
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
