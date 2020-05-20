import { useContext, useEffect, useState } from 'react';
import Routes from '@hourglass/routes';
import { getCSRFToken } from '@examTaker/helpers';
import { RailsContext } from '@examTaker/context';
import { AnomalyDetected } from '@examTaker/types';
import { installListeners, removeListeners } from './listeners';

function lockOut(): void {
  // TODO: redirect with flash
  const url = Routes.exams_path();
  window.location = url;
}

/**
 * Return a function that can be used to signal anomalies.
 * @param examID the ID of the current exam
 * @param registrationID the ID of the current registration
 */
const anom = (examID: number, registrationID: number) => (reason: string): void => {
  // TODO use event argument?
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
    .then(() => lockOut())
    .catch(() => lockOut());
};

/**
 * React hook to install anomaly listeners.
 */
export default function useAnomalyListeners(): void {
  const {
    railsExam,
    railsRegistration,
  } = useContext(RailsContext);
  const {
    policies,
  } = railsExam;
  const [lst, setLst] = useState([]);
  const anomalyDetected: AnomalyDetected = anom(railsExam.id, railsRegistration.id);
  useEffect(() => {
    setLst(installListeners(policies, anomalyDetected));
    return (): void => {
      removeListeners(lst);
      setLst([]);
    };
  }, []);
}
