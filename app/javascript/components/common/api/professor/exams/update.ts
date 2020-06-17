import { hitApi } from '@hourglass/common/types/api';

export interface ExamUpdateInfo {
  name: string;
  start: string;
  end: string;
  duration: number;
}

type Response = Good | Bad;

interface Good {
  updated: true;
}

interface Bad {
  updated: false;
  reason: string;
}

export function updateExam(examId: number, info: ExamUpdateInfo): Promise<Response> {
  return hitApi(`/api/professor/exams/${examId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      exam: info,
    }),
  });
}
