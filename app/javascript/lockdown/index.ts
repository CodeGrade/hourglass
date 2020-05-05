import listeners from './listeners';
import {
  ExamInfo,
  RegistrationInfo,
} from '@hourglass/types';
import Routes from '@hourglass/routes';
import { getCSRFToken } from '@hourglass/helpers';

/**
 * Lock down the client browser.
 * @throws Error if lockdown fails
 */
export async function lock(exam: ExamInfo, registration: RegistrationInfo) {
  // TODO take param for security settings to apply
  // - ignore-lockdown
  // - tolerate-windowed

  // browser detection
  // TODO: more robust browser detection, with version numbers:
  //   https://github.com/lancedikson/bowser
  // disallow mobile entirely!
  const isChrome = navigator.userAgent.search('Chrome') >= 0;
  const isFirefox = navigator.userAgent.search('Firefox') >= 0;
  if (!isChrome && !isFirefox) {
    throw new Error('Please use Chrome, Chromium, or Firefox to continue.');
  }

  if (!isFullscreen()) {
    try {
      await openFullscreen();
    } catch (e) {
      throw new Error("Error starting fullscreen mode.");
    }
  }

  if (!isFullscreen()) {
    await document.exitFullscreen();
    throw new Error("Developer console open.");
  }

  // Lockdown ready.

  // TODO install listeners with ability to send anomalies
  // listeners.forEach(({ event, handler }) => {
  //   window.addEventListener(event, handler);
  // });
}

function lockOut() {
  listeners.forEach(({ event, handler }) => {
    window.removeEventListener(event, handler);
  });
  // TODO: show flash
  const url = Routes.exams_path();
  //window.location = url;
}

export function anomalyDetected(reason: string, event: any) {
  console.error('ANOMALY DETECTED:', reason, event);
  const examID = 1; // TODO
  const registrationID = 1; // TODO
  const anomalyPath = Routes.exam_registration_anomalies_path(examID, registrationID);
  fetch(anomalyPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCSRFToken(),
    },
    credentials: 'same-origin',
    body: JSON.stringify({
      anomaly: {
        reason: reason
      },
    }),
  })
    .then(data => data.json())
    .then(data => {
      console.log("anomaly created:", data);

    })
    .then(() => {
      lockOut();
    })
    .catch(() => {
      // TODO
    });
}

export function isFullscreen() {
  const maximized = window.outerHeight == screen.height;
  const fullheight = window.innerHeight == window.outerHeight;
  const fullWidth = window.innerWidth == window.outerWidth;
  const covered = window.screenLeft == 0 && window.screenTop == 0;
  return maximized && fullheight && fullWidth && covered;
}

async function openFullscreen() {
  const elem = document.documentElement as any;
  if (elem.requestFullscreen) {
    return elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { // Firefox
    return elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
    return elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { // IE/Edge
    return elem.msRequestFullscreen();
  }
}
