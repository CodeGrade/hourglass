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
  newStartTime?: DateTime;
  percentTimeExpansion: number;
  registration: Registration;
}

interface ServerAccommodation extends Omit<Accommodation, 'newStartTime'> {
  newStartTime: string;
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
      newStartTime: a.newStartTime ? DateTime.fromISO(a.newStartTime) : undefined,
    })),
  };
}


export function useAccommodationsIndex(
  examId: number,
  deps?: React.DependencyList,
): ApiResponse<Response> {
  return useApiResponse(`/api/professor/exams/${examId}/accommodations`, undefined, transform, deps);
}
