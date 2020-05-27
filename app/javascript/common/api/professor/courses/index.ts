import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';

export interface Response {
  courses: Course[];
}

export interface Course {
  id: number;
  title: string;
}

export function useResponse(): ApiResponse<Response> {
  return useApiResponse('/api/professor/courses');
}
