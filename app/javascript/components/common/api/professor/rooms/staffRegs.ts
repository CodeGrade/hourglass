import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';

export interface Response {
  unassigned: Student[];
  proctors: Student[];
  rooms: Room[];
  sections: Section[];
}

export interface Section {
  id: number;
  title: string;
  students: Student[];
}

export interface Student {
  id: number;
  username: string;
  displayName: string;
}

export interface Room {
  id: number;
  name: string;
  proctors: Student[];
}


export function useResponse(examId: number, deps?: React.DependencyList): ApiResponse<Response> {
  return useApiResponse(`/api/professor/exams/${examId}/rooms/staff_regs`, undefined, undefined, deps);
}
