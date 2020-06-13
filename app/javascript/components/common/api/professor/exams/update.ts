import { hitApi } from '@hourglass/common/types/api';

export interface ExamUpdateInfo {
  name: string;
  start: string;
  end: string;
  duration: number;
}

export function updateExam(examId: number, info: ExamUpdateInfo): Promise<unknown> {
  return hitApi(`/api/professor/exams/${examId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      exam: info,
    }),
  });
}
