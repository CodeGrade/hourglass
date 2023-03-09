import React, {
  CSSProperties,
  MouseEventHandler,
  MouseEvent,
  useRef,
  useState,
  useEffect,
} from 'react';
import Icon from '@student/exams/show/components/Icon';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import './scrubber.scss';
import { FaCircle } from 'react-icons/fa';

// Inspired by https://github.com/nick-michael/react-scrubber

const clamp = (min: number, max: number, val: number): number => Math.min(Math.max(min, val), max);

export enum Direction {
  LeftRight = 'left-to-right',
  RightLeft = 'right-to-left',
  TopToBottom = 'top-to-bottom',
  BottomToTop = 'bottom-to-top',
}

type OptLabeledVal<T> = T | {
  val: T,
  label?: string,
  style?: CSSProperties,
}

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
  const [curSelectionRanges, setCurSelectionRanges] = useState<Range[]>([]);

  const minVal = locater(typeof min === 'object' && 'val' in min ? min.val : min);
  const maxVal = locater(typeof max === 'object' && 'val' in max ? max.val : max);
  const range = maxVal - minVal;
  const locatedPoints = pointsOfInterest.map((point) => {
    const pVal = (typeof point === 'object' && 'val' in point) ? point.val : point;
    const label = (typeof point === 'object' && 'label' in point) ? point.label : String(pVal);
    const style = (typeof point === 'object' && 'style' in point) ? point.style : ({ backgroundColor: barColor });
    return {
      position: (locater(pVal) - minVal) / range,
      val: pVal,
      label,
      style,
    };
  });
  const allPoints = [0, ...locatedPoints.map((p) => p.position), 1];
  const ranges: {rangeMin: number, rangeMax: number}[] = [];
  for (let i = 0; i < locatedPoints.length; i += 1) {
    if (i === 0) {
      ranges.push({
        rangeMin: allPoints[0],
        rangeMax: (allPoints[1] + allPoints[2]) / 2,
      });
    } else if (i === locatedPoints.length - 1) {
      ranges.push({
        rangeMin: ranges[i - 1].rangeMax,
        rangeMax: allPoints[i + 2],
      });
    } else {
      ranges.push({
        rangeMin: ranges[i - 1].rangeMax,
        rangeMax: (allPoints[i + 1] + allPoints[i + 2]) / 2,
      });
    }
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

  const dimensionMath = (rangeMin: number, rangeMax: number): CSSProperties => {
    switch (dir) {
      case Direction.LeftRight:
      case Direction.RightLeft:
        return {
          width: `${(rangeMax - rangeMin) * 100}%`,
        };
      case Direction.TopToBottom:
      case Direction.BottomToTop:
        return {
          height: `${(rangeMax - rangeMin) * 100}%`,
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
    const cursor = e.pageX - window.scrollX;
    const clamped = clamp(left, left + width, cursor);
    return (clamped - left) / width;
  };

  // Returns a percentage value
  const getPositionFromMouseY = (e: MouseEvent): number => {
    const containerDomNode = containerRef.current;
    if (!containerDomNode) {
      return 0;
    }
    const { top, height } = containerDomNode.getBoundingClientRect();
    const cursor = e.pageY - window.scrollY;
    const clamped = clamp(top, top + height, cursor);
    return (clamped - top) / height;
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
    const curSel = document.getSelection();
    setCurSelectionRanges(
      new Array(curSel.rangeCount).map((_, i) => curSel.getRangeAt(i).cloneRange()),
    );
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
      const curSel = document.getSelection();
      curSel.removeAllRanges();
      curSelectionRanges.forEach((r) => curSel.addRange(r));
    }
  };

  const handleMouseUp: MouseEventHandler<HTMLSpanElement> = (_e) => {
    setDragging(false);
    setCurSelectionRanges([]);
  };

  useEffect(() => {
    if (val !== undefined) {
      setCurValue(val);
      setCurPosition((locater(val) - minVal) / range);
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
        const style = locatedPoints[index]?.style ?? ({ backgroundColor: barColor });
        return (
          <span
            className="bar"
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            style={{
              ...positionMark(rangeMin),
              ...dimensionMath(rangeMin, rangeMax),
              ...style,
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
          <Icon I={FaCircle} size="1em" />
        </span>
      ))}
      <span
        ref={thumbRef}
        role="slider"
        aria-label="Scroll through versions"
        className="thumb"
        aria-valuenow={curValue ? locater(curValue) : minVal}
        tabIndex={0}
        title={dragging ? undefined : curLabel}
        onMouseDown={handleMouseDown}
        style={positionMark(curPosition)}
      />
    </div>
  );
}

export default Scrubber;
