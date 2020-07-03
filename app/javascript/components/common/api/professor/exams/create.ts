import { hitApi } from '@hourglass/common/types/api';

export interface ExamUpdateInfo {
  name: string;
  start: string;
  end: string;
  duration: number;
}

interface Good {
  created: true;
  id: number;
}

interface Bad {
  created: false;
  reason: string;
}

type Response = Good | Bad;

export default function createExam(courseId: number, info: ExamUpdateInfo): Promise<Response> {
  return hitApi(`/api/professor/courses/${courseId}/exams`, {
    method: 'POST',
    body: JSON.stringify({
      exam: info,
    }),
  });
}
