import { useEffect, useRef } from 'react';
import { getCSRFToken } from '@student/exams/show/helpers';
import { AnomalyDetected, Policy, policyPermits } from '@student/exams/show/types';
import { installListeners, removeListeners } from './listeners';

function lockOut(): void {
  window.location.href = '/';
}

/**
 * Return a function that can be used to signal anomalies.
 * @param examID the ID of the current exam
 * @param registrationID the ID of the current registration
 */
const anom = (examTakeUrl: string) => (reason: string): void => {
  fetch(examTakeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCSRFToken(),
    },
    credentials: 'same-origin',
    body: JSON.stringify({
      task: 'anomaly',
      anomaly: {
        reason,
      },
    }),
  })
    .then((data) => data.json())
    .then(() => lockOut())
    .catch(() => lockOut());
};

/**
 * React hook to install anomaly listeners.
 */
export default function useAnomalyListeners(
  examTakeUrl: string,
  policies: readonly Policy[],
  showAlert: (reason: string) => void,
): (() => void) {
  const lst = useRef([]);
  const anomalyDetected: AnomalyDetected = (
    policyPermits(policies, 'MOCK_LOCKDOWN')
      ? showAlert
      : anom(examTakeUrl)
  );
  const remover = (): void => {
    removeListeners(lst.current);
    lst.current = [];
  };
  useEffect(() => {
    lst.current = installListeners(policies, anomalyDetected);
    return remover;
  }, []);
  return remover;
}
