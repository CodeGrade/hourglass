import { hitApi } from '@hourglass/common/types/api';

export type Response = Good | Bad;

interface Good {
  created: true;
}

interface Bad {
  created: false;
  reason: string;
}

interface Body {
  unassigned: number[];
  proctors: number[];
  rooms: {
    [roomId: number]: number[];
  };
}

export function updateAll(examId: number, body: Body): Promise<Response> {
  return hitApi(`/api/professor/exams/${examId}/rooms/update_all_staff`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
