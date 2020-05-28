import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';

export interface Response {
  exams: Exam[];
}

export interface Exam {
  id: number;
  name: string;
}

export function useResponse(courseId: number): ApiResponse<Response> {
  return useApiResponse(`/api/professor/courses/${courseId}/exams`);
}
