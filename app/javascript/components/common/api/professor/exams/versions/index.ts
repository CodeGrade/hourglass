import { useApiResponse, ApiResponse } from '@hourglass/common/types/api';

interface Response {
  versions: Version[];
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

export interface Version {
  id: number;
  name: string;
  students: Student[];
}

export function useResponse(examId: number): ApiResponse<Response> {
  return useApiResponse(`/api/professor/exams/${examId}/versions`);
}
