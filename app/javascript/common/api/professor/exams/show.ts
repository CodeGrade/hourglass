import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';

export interface Response {
  name: string;
}

export function useResponse(examId: number): ApiResponse<Response> {
  return useApiResponse(`/api/professor/exams/${examId}`);
}
