import { hitApi } from '@hourglass/common/types/api';

export interface GradingLock {
  id: number;
}

interface Response {
  gradingLocks: GradingLock[];
}

export function useGradingLocksIndex(examId: number): Promise<Response> {
  return hitApi(`/exams/${examId}/grading_locks`);
}
