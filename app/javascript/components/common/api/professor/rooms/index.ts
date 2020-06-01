import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';

export interface Response {
  unassigned: Student[];
  rooms: Room[];
}

export interface Section {
  id: number;
  title: string;
  studentIds: number[];
}

export interface Student {
  id: number;
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
