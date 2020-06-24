import { hitApi } from '@hourglass/common/types/api';

export type Response = Good | Bad;

interface Good {
  success: true;
}

interface Bad {
  success: false;
  reason: string;
}

export function destroyAnomaly(anomalyId: number): Promise<Response> {
  return hitApi(`/api/proctor/anomalies/${anomalyId}`, {
    method: 'DELETE',
  });
}
