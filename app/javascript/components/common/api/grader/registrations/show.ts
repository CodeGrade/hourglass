import { ContentsState } from '@student/exams/show/types';
import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';

export interface Response {
  contents: ContentsState;
  user: {
    id: number;
    displayName: string;
  };
}

export function useRegistrationsShow(registrationId: number): ApiResponse<Response> {
  return useApiResponse(`/api/grader/registrations/${registrationId}`);
}
