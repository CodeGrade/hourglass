import {
  Policy,
  AnomalyDetected,
  AnomalyListener,
  policyPermits,
} from '@student/exams/show/types';
import { isFullscreen } from './helpers';

const listeners: {
  event: string;
  handler: (anomalyDetected: AnomalyDetected) => (e: Event) => void;
  capture?: boolean;
  repeated?: boolean;
}[] = [
  {
    event: 'keydown',
    handler: (_detected) => (e: KeyboardEvent): void => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
          case 'S': // save dialog
          case 'r':
          case 'R': // reload
          case 'h':
          case 'H': // history
          case 'w':
          case 'W': // close window
          case 'q':
          case 'Q': // quit
          case 'i':
          case 'I': // page info
            e.preventDefault();
            e.stopPropagation();
            break;
          default:
        }
      }
    },
    capture: true,
    repeated: true,
  },
  {
    event: 'keypress',
    handler: (_detected) => (e: KeyboardEvent): void => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
          case 'S': // save dialog
          case 'r':
          case 'R': // reload
          case 'h':
          case 'H': // history
          case 'w':
          case 'W': // close window
          case 'q':
          case 'Q': // quit
            e.preventDefault();
            e.stopPropagation();
            break;
          default:
        }
      }
    },
    capture: true,
    repeated: true,
  },
  {
    event: 'mouseout',
    handler: (detected) => (e: MouseEvent): void => {
      if (e.target === null || e.relatedTarget === null) {
        detected('moved the mouse out of the window', e);
      }
    },
  },
  {
    event: 'resize',
    handler: (detected) => (e: FocusEvent): void => {
      if (!isFullscreen()) {
        detected('left fullscreen', e);
      }
    },
  },
  {
    event: 'blur',
    handler: (detected) => (e: FocusEvent): void => {
      detected('unfocused the window', e);
    },
  },
  {
    event: 'contextmenu',
    handler: (_detected) => (e: Event): void => {
      e.preventDefault();
      e.stopPropagation();
      // detected('tried to use the context menu', e);
    },
  },
  {
    event: 'beforeunload',
    handler: (detected) => (e: Event): void => {
      detected('tried to navigate away', e);
    },
  },
];

export function installListeners(
  policies: readonly Policy[],
  detected: AnomalyDetected,
): AnomalyListener[] {
  if (policyPermits(policies, 'IGNORE_LOCKDOWN')) return [];
  const skipCleanup = policyPermits(policies, 'MOCK_LOCKDOWN');
  const handlers = listeners.map(({
    event,
    handler,
    capture,
    repeated,
  }) => {
    const f: EventListener = (...args) => {
      handler(detected)(...args);
      if (!skipCleanup && !repeated) {
        window.removeEventListener(event, f, capture);
      }
    };
    window.addEventListener(event, f, capture);
    return {
      event,
      handler: f,
    };
  });
  return handlers;
}

export function removeListeners(lst: AnomalyListener[]): void {
  lst.forEach(({ event, handler, capture }) => {
    window.removeEventListener(event, handler, capture);
  });
}
