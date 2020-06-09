import { RailsExamVersion, RailsRegistration, RailsCourse } from '@student/exams/show/types';
import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';
import { DateTime } from 'luxon';

export interface Server {
  railsExam: RailsExamVersion;
  railsRegistration: RailsRegistration;
  railsCourse: RailsCourse;
  final: boolean;
  lastSnapshot?: string;
}

export interface Res {
  railsExam: RailsExamVersion;
  railsRegistration: RailsRegistration;
  railsCourse: RailsCourse;
  final: boolean;
  lastSnapshot?: DateTime;
}

export function useResponse(examId: number): ApiResponse<Res> {
  return useApiResponse<Server, Res>(`/api/student/exams/${examId}`, {}, (res) => ({
    ...res,
    lastSnapshot: res.lastSnapshot ? DateTime.fromISO(res.lastSnapshot) : undefined,
  }));
}
