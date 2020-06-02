import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';
import { ContentsState, Policy } from '@student/exams/show/types';

export interface Response {
  exam: {
    name: string;
    policies: Policy[];
  };
  contents: ContentsState;
}

export function useResponse(examId: number): ApiResponse<Response> {
  return useApiResponse(`/api/professor/exams/${examId}`);
}
