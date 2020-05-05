import { useEffect, useState } from 'react';
import Routes from '@hourglass/routes';
import { getCSRFToken } from '@hourglass/helpers';
import { useExamInfoContext } from '@hourglass/context';
import { AnomalyDetected } from '@hourglass/types';
import { installListeners, removeListeners } from './listeners';

function lockOut() {
  // TODO: redirect with flash
  const url = Routes.exams_path();
  window.location = url;
}

const anomalyDetectedForExam = (examID: number, registrationID: number) => (reason: string, event: any) => {
  console.error('ANOMALY DETECTED:', reason, event);
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
        reason,
      },
    }),
  })
    .then((data) => data.json())
    .then((data) => lockOut())
    .catch(() => lockOut());
};

/**
 * React hook to install anomaly listeners.
 */
export function useAnomalyListeners(preview: boolean) {
  const {
    exam,
    registration,
  } = useExamInfoContext();
  const [lst, setLst] = useState([]);
  const anomalyDetected: AnomalyDetected = anomalyDetectedForExam(exam.id, registration.id);
  useEffect(() => {
    if (!preview) {
      setLst(installListeners(anomalyDetected));
      return () => {
        removeListeners(lst);
        setLst([]);
      };
    }
  }, [preview]);
}
