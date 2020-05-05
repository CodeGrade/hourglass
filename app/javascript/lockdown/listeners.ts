import { AnomalyDetected, AnomalyListener } from '@hourglass/types';
import { isFullscreen } from './helpers';

export function installListeners(detected: AnomalyDetected): AnomalyListener[] {
  const handlers = listeners.map(({ event, handler }) => {
    const f = handler(detected);
    window.addEventListener(event, f);
    return {
      event,
      handler: f,
    };
  });
  return [];
}

export function removeListeners(lst: AnomalyListener[]) {
  lst.forEach(({ event, handler }) => {
    window.removeEventListener(event, handler);
  });
}

export const listeners: {
  event: string;
  handler: (anomalyDetected: AnomalyDetected) => (e: any) => void;
}[] = [
  {
    event: 'mouseout',
    handler: (detected) => (e) => {
      if (e.toElement === null && e.relatedTarget === null) {
        detected('mouseout', e);
      }
    },
  },
  {
    event: 'resize',
    handler: (detected) => (e) => {
      if (!isFullscreen()) {
        detected('left fullscreen', e);
      }
    },
  },
  {
    event: 'blur',
    handler: (detected) => (e) => {
      detected('window blurred', e);
    },
  },
  {
    event: 'contextmenu',
    handler: (detected) => (e) => {
      e.preventDefault();
      e.stopPropagation();
      detected('tried context menu', e);
    },
  },
];
