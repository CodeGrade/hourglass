import { hitApi } from '@hourglass/common/types/api';

type Response = Good | Bad;

interface Good {
  success: true;
}

interface Bad {
  success: false;
  reason: string;
}

export default function destroyAccommodation(accommodationId: number): Promise<Response> {
  return hitApi(`/api/professor/accommodations/${accommodationId}`, {
    method: 'DELETE',
  });
}
