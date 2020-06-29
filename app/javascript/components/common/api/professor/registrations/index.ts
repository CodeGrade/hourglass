import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';

export interface Registration {
  id: number;
  displayName: string;
}

interface Response {
  registrations: Registration[];
}

export function useRegistrationsIndex(examId: number): ApiResponse<Response> {
  return useApiResponse(`/api/professor/exams/${examId}/registrations`);
}
