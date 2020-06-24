import { useApiResponse, ApiResponse } from '@hourglass/common/types/api';

export interface Registration {
  id: number;
  user: {
    id: number;
    displayName: string;
  };
}

type Response = Registration[];

export function useResponse(examId: number): ApiResponse<Response> {
  return useApiResponse(`/api/grader/exams/${examId}/registrations`);
}
