import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';
import { DateTime } from 'luxon';

interface User {
  displayName: string;
}

interface Registration {
  id: number;
  user: User;
}

export interface Accommodation {
  id: number;
  startTime?: DateTime;
  extraTime: number;
  reg: Registration;
}

interface ServerAccommodation extends Omit<Accommodation, 'startTime'> {
  startTime: string;
}

interface Server {
  accommodations: ServerAccommodation[];
}

export interface Response {
  accommodations: Accommodation[];
}

function transform(s: Server): Response {
  return {
    accommodations: s.accommodations.map((a) => ({
      ...a,
      startTime: a.startTime ? DateTime.fromISO(a.startTime) : undefined,
    })),
  };
}


export function useAccommodationsIndex(
  examId: number,
  deps?: React.DependencyList,
): ApiResponse<Response> {
  return useApiResponse(`/api/professor/exams/${examId}/accommodations`, undefined, transform, deps);
}
