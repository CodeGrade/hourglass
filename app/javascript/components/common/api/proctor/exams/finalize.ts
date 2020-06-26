import { hitApi } from '@hourglass/common/types/api';

export interface Target {
  type: 'EXAM' | 'VERSION' | 'ROOM' | 'USER';
  id: number;
}

type Response = Good | Bad;

interface Good {
  success: true;
}

interface Bad {
  success: false;
  reason: string;
}

export function doFinalize(examId: number, target: Target): Promise<Response> {
  return hitApi(`/api/proctor/exams/${examId}/finalize`, {
    method: 'POST',
    body: JSON.stringify({
      target,
    }),
  });
}
