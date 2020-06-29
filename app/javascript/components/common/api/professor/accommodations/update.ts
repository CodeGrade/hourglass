import { hitApi } from '@hourglass/common/types/api';
import { DateTime } from 'luxon';

type Response = Good | Bad;

interface Good {
  success: true;
}

interface Bad {
  success: false;
  reason: string;
}

export interface Body {
  startTime?: DateTime;
  extraTime: number;
}

export function updateAccommodation(accommodationId: number, body: Body): Promise<Response> {
  return hitApi(`/api/professor/accommodations/${accommodationId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      accommodation: body,
    }),
  });
}
