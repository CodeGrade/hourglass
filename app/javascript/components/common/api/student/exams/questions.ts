import { ProfQuestion, RailsExamQuestion } from '@student/exams/show/types';
import { hitApi } from '@hourglass/common/types/api';
import { convertQs } from '@hourglass/workflows/student/exams/show/helpers';

export interface Response {
  questions: ProfQuestion[];
}

interface Server {
  questions: RailsExamQuestion[];
}

export async function getAllQuestions(
  examId: number,
): Promise<Response> {
  const res = await hitApi<Server>(`/api/student/exams/${examId}/questions`);
  return {
    questions: convertQs(res.questions),
  };
}
