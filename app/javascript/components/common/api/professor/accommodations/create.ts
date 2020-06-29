import { hitApi } from '@hourglass/common/types/api';

export type Response = Good | Bad;

interface Good {
  success: true;
}

interface Bad {
  success: false;
  reason: string;
}

export function createAccommodation(examId: number, registrationId: number): Promise<Response> {
  return hitApi(`/api/professor/exams/${examId}/accommodations`, {
    method: 'POST',
    body: JSON.stringify({
      registrationId,
    }),
  });
}
