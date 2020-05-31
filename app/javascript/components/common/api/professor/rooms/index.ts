import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';

export interface Response {
  unassigned: Student[];
  rooms: Room[];
}

export interface Student {
  username: string;
  displayName: string;
}

export interface Room {
  id: number;
  name: string;
  students: Student[];
}


export function useResponse(examId: number): ApiResponse<Response> {
  return useApiResponse(`/api/professor/exams/${examId}/rooms`);
}
