import { hitApi } from '@hourglass/common/types/api';
import { ExamUpdateInfo } from './update';

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
