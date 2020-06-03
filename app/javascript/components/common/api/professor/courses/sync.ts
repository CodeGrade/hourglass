import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';

export type Response = Good | Bad;

interface Good {
  synced: true;
}

interface Bad {
  synced: false;
  reason: string;
}

export function useResponse(courseId: number): ApiResponse<Response> {
  return useApiResponse(
    `/api/professor/courses/${courseId}/sync`,
    {
      method: 'POST',
    },
  );
}
