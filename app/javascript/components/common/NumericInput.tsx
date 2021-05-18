import React, { KeyboardEventHandler } from 'react';
import {
  Form,
  ButtonGroup,
  Button,
  ButtonProps,
  InputGroup,
  FormControlProps,
} from 'react-bootstrap';
import { WrappedFieldProps } from 'redux-form';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
import './NumericInput.scss';

export const normalizeNumber = (newval : string, prevval : string) : string => {
  if (newval === '') { return ''; }
  if (/^-?\d*\.?\d*$/.test(newval)) {
    return newval;
  }
  return prevval;
};

const validKeys = {
  ArrowLeft: true,
  ArrowRight: true,
  ArrowUp: true,
  ArrowDown: true,
  Backspace: true,
  Delete: true,
  End: true,
  Home: true,
  Tab: true,
};
const validKeyCodes = {
  9: true, // Tab
};

const patchEvent = (e) => {
  try {
    if (e.key === undefined) {
      // We're on Safari :(
      switch (e.which) {
        case 8: e.key = 'Backspace'; break;
        case 9: e.key = 'Tab'; break;
        case 35: e.key = 'End'; break;
        case 36: e.key = 'Home'; break;
        case 37: e.key = 'ArrowLeft'; break;
        case 38: e.key = 'ArrowUp'; break;
        case 39: e.key = 'ArrowRight'; break;
        case 40: e.key = 'ArrowDown'; break;
        case 46: e.key = 'Delete'; break;
        case 48: case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57:
          e.key = String.fromCharCode(e.which); break;
        case 189: e.key = '-'; break;
        case 190: e.key = '.'; break;
        default: e.key = 'Unknown';
      }
    }
  } catch (_) {
    // nothing to do: this was a monkey-patch at best
  }
};

const validateNumericInput : KeyboardEventHandler<HTMLInputElement> = (e) => {
  patchEvent(e);
  if (validKeys[e.key] || validKeyCodes[e.keyCode] || validKeyCodes[e.which]) return;
  if (e.key.match(/^F\d+$/)) return;
  if (!Number.isNaN(Number(e.key)) && (Number(e.key) === Number.parseInt(e.key, 10))) return;
  if (e.key === '.') {
    const indexOfDot = e.currentTarget.value.indexOf('.');
    if (indexOfDot < 0) return;
    if (e.currentTarget.selectionStart <= indexOfDot
        && indexOfDot < e.currentTarget.selectionEnd) {
      return;
    }
  }
  if (e.key === '-') {
    const indexOfMinus = e.currentTarget.value.indexOf('-');
    if (indexOfMinus < 0 && e.currentTarget.selectionStart === 0) return;
    if (e.currentTarget.selectionStart <= indexOfMinus
        && indexOfMinus < e.currentTarget.selectionEnd) {
      return;
    }
  }
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  e.preventDefault();
};

const clamp = (val : number, min ?: number, max ?: number) : number => {
  if (min !== undefined && val < min) return min;
  if (max !== undefined && val > max) return max;
  return val;
};

export type ChangeHandler =
  ((val: string | number, focused: true) => void)
  & ((val: number, focused: false) => void);

export const NumericInput: React.FC<{
  size?: FormControlProps['size'],
  className?: string,
  variant?: ButtonProps['variant'],
  disabled?: boolean,
  placeholder?: string,
  min?: number,
  max?: number,
  step?: number,
  onChange?: ChangeHandler;
  value?: number | string,
}> = (props) => {
  const {
    className,
    size,
    variant,
    placeholder,
    min,
    max,
    step = 1,
    disabled = false,
    onChange,
    value,
  } = props;
  const numValue = Number(value) || 0;
  return (
    <InputGroup className="numeric-input">
      <Form.Control
        className={className}
        size={size}
        value={value}
        placeholder={placeholder}
        onKeyPress={validateNumericInput}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (onChange) onChange(clamp(numValue + step, min, max), true);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (onChange) onChange(clamp(numValue - step, min, max), true);
          }
        }}
        onPaste={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const data = e.clipboardData?.getData('text');
          const curVal = e.currentTarget.value;
          const selStart = e.currentTarget.selectionStart;
          const selEnd = e.currentTarget.selectionEnd;
          const nextVal = `${curVal.slice(0, selStart)}${data}${curVal.slice(selEnd)}`;
          const nextAsNum = Number(nextVal);
          if (Number.isFinite(nextAsNum)) {
            onChange(clamp(nextAsNum, min, max), true);
          }
        }}
        disabled={disabled}
        onChange={(e) => {
          if (onChange) {
            onChange(e.target.value, true);
          }
        }}
        onBlur={() => { if (onChange) onChange(clamp(numValue, min, max), false); }}
      />
      <InputGroup.Append className="align-self-stretch">
        <ButtonGroup vertical className="h-100">
          <Button
            size="sm"
            className="h-50 m-0 button-up"
            variant={variant}
            disabled={disabled || (max !== undefined && numValue >= max)}
            tabIndex={-1}
            onClick={() => onChange(clamp(numValue + step, min, max), false)}
          >
            <Icon className="m-0 p-0" size={size === 'lg' ? '0.75em' : '0.5em'} I={FaChevronUp} />
          </Button>
          <Button
            size="sm"
            className="h-50 m-0 button-down"
            variant={variant}
            disabled={disabled || (min !== undefined && numValue <= min)}
            tabIndex={-1}
            onClick={() => onChange(clamp(numValue - step, min, max), false)}
          >
            <Icon size={size === 'lg' ? '0.75em' : '0.5em'} I={FaChevronDown} />
          </Button>
        </ButtonGroup>
      </InputGroup.Append>
    </InputGroup>
  );
};

// Adapter to propagate onChange and value from a Field to the control
export const NumericInputField: React.FC<WrappedFieldProps & {
  size?: FormControlProps['size'],
  variant?: ButtonProps['variant'],
  disabled?: boolean,
  placeholder?: string,
  min?: number,
  max?: number,
  step?: number,
}> = (props) => {
  const {
    size,
    variant,
    placeholder,
    min,
    max,
    step = 1,
    disabled = false,
    input,
  } = props;
  const { onChange, value } = input;
  return (
    <NumericInput
      size={size}
      variant={variant}
      disabled={disabled}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
    />
  );
};
