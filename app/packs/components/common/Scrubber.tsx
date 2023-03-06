import React, {
  CSSProperties,
  MouseEventHandler,
  MouseEvent,
  useRef,
  useState,
  useEffect,
} from 'react';
import Icon from '@student/exams/show/components/Icon';
import { FaMapMarker } from 'react-icons/fa';
import { BiCurrentLocation } from 'react-icons/bi';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import './scrubber.scss';

// Inspired by https://github.com/nick-michael/react-scrubber

const clamp = (min: number, max: number, val: number): number => Math.min(Math.max(min, val), max);

export enum Direction {
  LeftRight = 'left-to-right',
  RightLeft = 'right-to-left',
  TopToBottom = 'top-to-bottom',
  BottomToTop = 'bottom-to-top',
}

type OptLabeledVal<T> = T | { val: T, label?: string, color?: string }

export interface ScrubberProps<T> {
  min: OptLabeledVal<T>;
  max: OptLabeledVal<T>;
  val?: T;
  locater?: (val: T) => number;
  dir?: Direction;
  pointsOfInterest?: OptLabeledVal<T>[];
  onChange?: (curPct: number, nearestVal?: T) => void;
  smooth?: boolean;
  showPins?: boolean;
  barColor?: string;
}

function Scrubber<T>(props: ScrubberProps<T>): ReturnType<React.FC<ScrubberProps<T>>> {
  const {
    min,
    max,
    val,
    locater = Number,
    dir = Direction.LeftRight,
    pointsOfInterest = [],
    onChange,
    smooth = false,
    showPins = true,
    barColor = 'navy',
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const [curValue, setCurValue] = useState<T>(null);
  const [curPosition, setCurPosition] = useState<number>(0);
  const [curLabel, setCurLabel] = useState<string>(null);
  const [dragging, setDragging] = useState<boolean>(false);

  const minVal = locater(typeof min === 'object' && 'val' in min ? min.val : min);
  const maxVal = locater(typeof max === 'object' && 'val' in max ? max.val : max);
  const range = maxVal - minVal;
  const locatedPoints = pointsOfInterest.map((point) => {
    const pVal = (typeof point === 'object' && 'val' in point) ? point.val : point;
    const label = (typeof point === 'object' && 'label' in point) ? point.label : String(pVal);
    const color = (typeof point === 'object' && 'color' in point) ? point.color : barColor;
    return {
      position: (locater(pVal) - minVal) / range,
      val: pVal,
      label,
      color,
    };
  });
  const allPoints = locatedPoints.map((p) => p.position);
  const ranges: {rangeMin: number, rangeMax: number}[] = [];
  for (let i = 1; i < allPoints.length; i += 1) {
    const rangeMin = ranges[i - 2]?.rangeMax ?? 0;
    const rangeMax = (allPoints[i - 1] + allPoints[i]) / 2;
    ranges.push({ rangeMin, rangeMax });
  }

  const positionMark = (markVal: number): CSSProperties => {
    switch (dir) {
      case Direction.LeftRight:
      case Direction.RightLeft:
        return {
          left: `${markVal * 100}%`,
        };
      case Direction.TopToBottom:
      case Direction.BottomToTop:
        return {
          top: `${markVal * 100}%`,
        };
      default:
        throw new ExhaustiveSwitchError(dir);
    }
  };

  // Returns a percentage value
  const getPositionFromMouseX = (e: MouseEvent): number => {
    const containerDomNode = containerRef.current;
    if (!containerDomNode) {
      return 0;
    }
    const { left, width } = containerDomNode.getBoundingClientRect();
    const cursor = e.pageX;
    const clamped = clamp(left, left + width, cursor);
    return (clamped - left) / width;
  };

  // Returns a percentage value
  const getPositionFromMouseY = (e: MouseEvent): number => {
    const containerDomNode = containerRef.current;
    if (!containerDomNode) {
      return 0;
    }
    const { bottom, height } = containerDomNode.getBoundingClientRect();
    const cursor = e.pageY;
    const clamped = clamp(bottom - height, bottom, cursor);
    return (bottom - clamped) / height;
  };

  const getPositionFromCursor = (e: MouseEvent): number => {
    switch (dir) {
      case Direction.LeftRight:
        return getPositionFromMouseX(e);
      case Direction.RightLeft:
        return 1 - getPositionFromMouseX(e);
      case Direction.TopToBottom:
        return getPositionFromMouseY(e);
      case Direction.BottomToTop:
        return 1 - getPositionFromMouseY(e);
      default:
        throw new ExhaustiveSwitchError(dir);
    }
  };

  const handleMouseDown: MouseEventHandler<HTMLSpanElement> = (_e) => {
    setDragging(true);
  };

  const handleMouseMove: MouseEventHandler<HTMLSpanElement> = (e) => {
    if (dragging) {
      const mousePosAsPct = getPositionFromCursor(e);
      if (!smooth) {
        let nearestT = curValue;
        let nearestPos = curPosition;
        let nearestDist = Math.abs(mousePosAsPct - curPosition);
        let nearestLabel = curLabel;
        locatedPoints.forEach(({ position, val: pVal, label }) => {
          if (Math.abs(position - mousePosAsPct) < nearestDist) {
            nearestT = pVal;
            nearestDist = Math.abs(position - mousePosAsPct);
            nearestPos = position;
            nearestLabel = label ?? String(pVal);
          }
        });
        if (onChange && (nearestPos !== curPosition || nearestT !== curValue)) {
          onChange(nearestPos, nearestT);
        }
        setCurPosition(nearestPos);
        setCurValue(nearestT);
        setCurLabel(nearestLabel);
      } else {
        if (onChange) { onChange(mousePosAsPct); }
        setCurPosition(mousePosAsPct);
        setCurLabel(String(minVal + mousePosAsPct * range));
      }
    }
  };

  const handleMouseUp: MouseEventHandler<HTMLSpanElement> = (_e) => {
    setDragging(false);
  };

  useEffect(() => {
    if (val !== undefined) {
      setCurValue(val);
      setCurPosition(locater(val));
    } else {
      setCurValue(typeof min === 'object' && 'val' in min ? min.val : min);
      setCurPosition(0);
    }
  }, [val]);
  return (
    <div
      role="scrollbar"
      aria-controls="slider"
      tabIndex={0}
      aria-valuenow={curValue ? locater(curValue) : minVal}
      className={`scrubber ${dir}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      ref={containerRef}
    >
      <span className="bar" style={{ backgroundColor: barColor }} />
      {ranges.map(({ rangeMin, rangeMax }, index) => {
        const color = locatedPoints[index]?.color ?? barColor;
        return (
          <span
            className="bar"
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            style={{
              ...positionMark(rangeMin),
              width: `${rangeMax * 100}%`,
              backgroundColor: color,
            }}
          />
        );
      })}
      {showPins && locatedPoints.map(({ position, label }, index) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="point-of-interest"
          style={positionMark(position)}
          title={label}
        >
          <Icon I={FaMapMarker} />
        </span>
      ))}
      <span
        ref={thumbRef}
        role="slider"
        className="thumb"
        aria-valuenow={curValue ? locater(curValue) : minVal}
        tabIndex={0}
        title={dragging ? undefined : curLabel}
        onMouseDown={handleMouseDown}
        style={positionMark(curPosition)}
      >
        <Icon I={BiCurrentLocation} />
      </span>
    </div>
  );
}

export default Scrubber;
