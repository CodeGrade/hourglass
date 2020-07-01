import { hitApi } from '@hourglass/common/types/api';

export default function startGrading(examId: number): Promise<unknown> {
  return hitApi(`/api/professor/exams/${examId}/grading_locks/start_grading`, {
    method: 'POST',
  });
}
