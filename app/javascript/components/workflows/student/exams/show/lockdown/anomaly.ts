import { useContext, useEffect, useState } from 'react';
import { getCSRFToken } from '@student/exams/show/helpers';
import { RailsContext } from '@student/exams/show/context';
import { AnomalyDetected } from '@student/exams/show/types';
import { installListeners, removeListeners } from './listeners';

function lockOut(): void {
  // TODO: redirect with flash
  window.location.href = '/';
}

/**
 * Return a function that can be used to signal anomalies.
 * @param examID the ID of the current exam
 * @param registrationID the ID of the current registration
 */
const anom = (examTakeUrl: string) => (reason: string): void => {
  // TODO use event argument?
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
export default function useAnomalyListeners(): void {
  const {
    railsExam,
  } = useContext(RailsContext);
  const {
    policies,
  } = railsExam;
  const [lst, setLst] = useState([]);
  const anomalyDetected: AnomalyDetected = anom(railsExam.takeUrl);
  useEffect(() => {
    setLst(installListeners(policies, anomalyDetected));
    return (): void => {
      removeListeners(lst);
      setLst([]);
    };
  }, []);
}
