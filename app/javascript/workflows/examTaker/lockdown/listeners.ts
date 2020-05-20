import {
  Policy,
  AnomalyDetected,
  AnomalyListener,
  policyPermits,
} from '@examTaker/types';
import { isFullscreen } from './helpers';

const listeners: {
  event: string;
  handler: (anomalyDetected: AnomalyDetected) => (e: Event) => void;
}[] = [
  {
    event: 'mouseout',
    handler: (detected) => (e: MouseEvent): void => {
      if (e.target === null || e.relatedTarget === null) {
        detected('mouseout', e);
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
      detected('window blurred', e);
    },
  },
  {
    event: 'contextmenu',
    handler: (detected) => (e: Event): void => {
      e.preventDefault();
      e.stopPropagation();
      detected('tried context menu', e);
    },
  },
];

export function installListeners(policies: Policy[], detected: AnomalyDetected): AnomalyListener[] {
  if (policyPermits(policies, 'ignore-lockdown')) return [];

  const handlers = listeners.map(({ event, handler }) => {
    const f = handler(detected);
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
