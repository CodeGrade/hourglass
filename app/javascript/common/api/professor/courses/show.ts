import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';

export interface Course {
  id: number;
  title: string;
}

export interface Response {
  course: Course;
}

export function useResponse(courseId: number): ApiResponse<Response> {
  return useApiResponse(`/api/professor/courses/${courseId}`);
}
