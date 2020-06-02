import { RailsExam, RailsRegistration, RailsCourse } from '@student/exams/show/types';
import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';

export interface Response {
  railsExam: RailsExam;
  railsRegistration: RailsRegistration;
  railsCourse: RailsCourse;
  final: boolean;
}

export function useResponse(examId: number): ApiResponse<Response> {
  return useApiResponse(`/api/student/exams/${examId}`);
}
