import { RailsUser } from '@student/exams/show/types';
import { ApiResponse, useApiResponse } from '../types/api';

export interface Response {
  user: RailsUser;
}

export function useResponse(): ApiResponse<Response> {
  return useApiResponse('/api/me');
}
