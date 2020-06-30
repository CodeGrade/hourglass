import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';
import { ContentsState, Policy } from '@student/exams/show/types';

export interface Response {
  id: number;
  name: string;
  policies: Policy[];
  contents: ContentsState;
  anyStarted: boolean;
}

export function useVersionsShow(versionId: number): ApiResponse<Response> {
  return useApiResponse(`/api/grader/versions/${versionId}`);
}
