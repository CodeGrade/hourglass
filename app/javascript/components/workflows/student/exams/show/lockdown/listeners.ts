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
}[] = [
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
    handler: (detected) => (e: Event): void => {
      e.preventDefault();
      e.stopPropagation();
      detected('tried to use the context menu', e);
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
  if (policyPermits(policies, Policy.ignoreLockdown)) return [];
  const skipCleanup = policyPermits(policies, Policy.mockLockdown);
  const handlers = listeners.map(({ event, handler }) => {
    const f: EventListener = (...args) => {
      handler(detected)(...args);
      if (!skipCleanup) {
        window.removeEventListener(event, f);
      }
    };
    window.addEventListener(event, f);
    return {
      event,
      handler: f,
    };
  });
  return handlers;
}

export function removeListeners(lst: AnomalyListener[]): void {
  lst.forEach(({ event, handler }) => {
    window.removeEventListener(event, handler);
  });
}
