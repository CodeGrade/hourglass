import React, {
  useCallback, useEffect, useMemo, useRef,
} from 'react';

export const drawAlertBubble = (
  context: CanvasRenderingContext2D,
  message: string,
  vertical?: 'top' | 'bot',
  horizontal?: 'left' | 'right',
  fillColor?: string,
  textColor?: string,
) => {
  const canvasSize = context.canvas.width;
  const Padding = canvasSize / 5;
  // Allow readable text across differnts iconSizes
  context.font = `bold ${canvasSize - Padding * 2}px arial`;

  const measured = context.measureText(message);
  const w = Math.min(
    // Take the text with if it's smaller than available space (eg: '2')
    measured.width,
    // Or take the maximum size we'll force our text to fit in anyway (eg: '1000000')
    canvasSize - Padding,
  ) + Padding;
  const h = Math.min(
    measured.actualBoundingBoxAscent + measured.actualBoundingBoxDescent,
    context.canvas.height - Padding,
  ) + Padding;

  const x = horizontal === 'left' ? 0 : canvasSize - w;
  const y = vertical === 'top' ? 0 : canvasSize / 2 - Padding;
  const r = Math.min(w / 2, h / 2);

  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
  context.fillStyle = fillColor;
  context.fill();
  context.fillStyle = textColor;
  context.textBaseline = 'bottom';
  context.textAlign = 'right';
  context.fillText(
    message,
    canvasSize - Padding / 2,
    canvasSize,
    // This will prevent the text from going outside the favicon,
    // instead it'll squeeze his with to fit in
    canvasSize - Padding,
  );
};

const drawFrame = (
  frameNum: React.MutableRefObject<number>,
  options: IconSource[],
  initialImages: string[],
  currentImages: CanvasRenderingContext2D[],
) => {
  let img: string;
  let curFrameNum = frameNum.current % options.length;
  let prevFrameNum = (frameNum.current - 1) % options.length;
  let found = false;
  for (let i = 0; i < options.length; i += 1) {
    const curFrameAttempt = options[curFrameNum % options.length];
    if (typeof curFrameAttempt === 'string') {
      img = curFrameAttempt;
      found = true;
      break;
    } else {
      try {
        if (currentImages[curFrameNum] === null && currentImages[prevFrameNum] !== null) {
          const canvas = document.createElement('canvas');
          canvas.width = currentImages[prevFrameNum].canvas.width;
          canvas.height = currentImages[prevFrameNum].canvas.height;
          // eslint-disable-next-line no-param-reassign
          currentImages[curFrameNum] = canvas.getContext('2d');
        }
        const ans = curFrameAttempt(
          initialImages[curFrameNum],
          currentImages[curFrameNum],
          currentImages[prevFrameNum],
        );
        if (typeof ans === 'string') {
          img = ans;
          found = true;
          break;
        }
      } catch (e) {
        // nothing to do here, try the next one
      }
    }
    prevFrameNum = curFrameNum;
    curFrameNum = (curFrameNum + 1) % options.length;
  }
  if (!found) {
    throw new Error('Could not find workable frame');
  }
  // eslint-disable-next-line no-param-reassign
  frameNum.current = curFrameNum;
  const favicon = document.getElementById('favicon') as HTMLLinkElement;
  favicon.href = img;
};

type IconSource = (
  string // url of image
  | ((
    initial: string, // initial url of image
    // previous canvas of *this* frame of the animation sequence
    previous?: CanvasRenderingContext2D,
    // previous canvas that was displayed (preceding frame of animation sequence)
    previousFrame?: CanvasRenderingContext2D,
  ) => (string | undefined | null)));
export const FaviconRotation: React.FC<{
  options: IconSource | IconSource[],
  animated?: boolean,
  animationDelay?: number,
}> = (props) => {
  const {
    options: rawOptions,
    animated,
    animationDelay,
  } = props;
  const options = (rawOptions instanceof Array) ? rawOptions : [rawOptions];
  const initialImages: string[] = useMemo(() => [], [rawOptions]);
  const currentImages: CanvasRenderingContext2D[] = useMemo(() => [], [rawOptions]);
  useEffect(() => {
    options.forEach((s, index) => {
      if (s instanceof Function) {
        initialImages[index] = '';
        currentImages[index] = null;
      } else {
        const img = document.createElement('img');
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const context = canvas.getContext('2d');
          context.clearRect(0, 0, img.width, img.height);
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
          initialImages[index] = canvas.toDataURL();
          currentImages[index] = context;
        };
        img.src = s;
      }
    });
  }, [rawOptions]);
  const animationTickIntervalId = useRef(null);
  const animationIndex = useRef(0);

  const onAnimationTick = useCallback(() => {
    drawFrame(animationIndex, options, initialImages, currentImages);
    animationIndex.current += 1;
  }, [rawOptions]);

  useEffect(() => {
    if (animated) {
      if (!animationTickIntervalId.current) {
        const intervalId = setInterval(onAnimationTick, animationDelay);
        animationTickIntervalId.current = intervalId;
      }
    } else {
      if (animationTickIntervalId.current) {
        clearInterval(animationTickIntervalId.current);
        animationTickIntervalId.current = null;
      }
      drawFrame(animationIndex, options, initialImages, currentImages);
    }
    return () => {
      if (animationTickIntervalId.current !== null) {
        clearInterval(animationTickIntervalId.current);
        animationTickIntervalId.current = null;
        drawFrame({ current: 0 }, options, initialImages, currentImages);
      }
    };
  }, [animationDelay, animated, rawOptions, onAnimationTick]);

  return null;
};
