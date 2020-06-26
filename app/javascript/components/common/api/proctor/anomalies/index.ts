import { DateTime } from 'luxon';
import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';

interface ServerAnomaly {
  id: number;
  user: {
    displayName: string;
    id: number;
  };
  reg: {
    id: number;
    final: boolean;
  };
  time: string;
  reason: string;
}

export interface Anomaly extends Omit<ServerAnomaly, 'time'> {
  time: DateTime;
}

interface Server {
  anomalies: ServerAnomaly[];
}

interface Response {
  anomalies: Anomaly[];
}

function transform(res: Server): Response {
  return {
    anomalies: res.anomalies.map((a) => ({
      ...a,
      time: DateTime.fromISO(a.time),
    })),
  };
}

export function useResponse(examId: number, deps?: React.DependencyList): ApiResponse<Response> {
  return useApiResponse<Server, Response>(`/api/proctor/exams/${examId}/anomalies`, undefined, transform, deps);
}
