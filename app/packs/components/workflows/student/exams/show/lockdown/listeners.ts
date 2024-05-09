import {
  Policy,
  AnomalyDetected,
  AnomalyListener,
  policyPermits,
} from '@student/exams/show/types';
import { isFullscreen } from './helpers';
import { clearClipboard } from './lock';

const listeners: {
  event: string;
  handler: (anomalyDetected: AnomalyDetected) => (e: Event) => Promise<void>;
  capture?: boolean;
  repeated?: boolean;
}[] = [
  {
    event: 'keydown',
    handler: (_detected) => async (e: KeyboardEvent): Promise<void> => {
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
    handler: (_detected) => async (e: KeyboardEvent): Promise<void> => {
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
    handler: (detected) => async (e: MouseEvent): Promise<void> => {
      if (e.target === null || e.relatedTarget === null) {
        await clearClipboard();
        detected('moved the mouse out of the window', e);
      }
    },
  },
  {
    event: 'fullscreenchange',
    handler: (detected) => async (e: Event): Promise<void> => {
      requestAnimationFrame(async (_time) => {
        if (!isFullscreen() || document.fullscreenElement === null) {
          await clearClipboard();
          detected('left fullscreen', e);
        }
      });
    },
  },
  {
    event: 'resize',
    handler: (detected) => async (e: FocusEvent): Promise<void> => {
      if (!isFullscreen()) {
        await clearClipboard();
        detected('resized window', e);
      }
    },
  },
  {
    event: 'blur',
    handler: (detected) => async (e: FocusEvent): Promise<void> => {
      await clearClipboard();
      detected('unfocused the window', e);
    },
  },
  {
    event: 'contextmenu',
    handler: (_detected) => async (e: Event): Promise<void> => {
      e.preventDefault();
      e.stopPropagation();
      // detected('tried to use the context menu', e);
    },
  },
  {
    event: 'beforeunload',
    handler: (detected) => async (e: Event): Promise<void> => {
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
    const f: EventListener = async (...args) => {
      await handler(detected)(...args);
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
