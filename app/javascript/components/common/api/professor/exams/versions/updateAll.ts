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
  unassigned: number[]; // student IDs
  versions: {
    [versionId: number]: number[]; // student IDs
  };
}

export function updateAll(examId: number, body: Body): Promise<Response> {
  return hitApi(`/api/professor/exams/${examId}/versions/update_all`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
