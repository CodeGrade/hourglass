import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';
import { ContentsState, Policy } from '@student/exams/show/types';
import { DateTime } from 'luxon';

interface Server {
  name: string;
  duration: number;
  start: string;
  end: string;
  versions: Version[];
}

export interface Response {
  name: string;
  duration: number;
  start: DateTime;
  end: DateTime;
  versions: Version[];
}

export interface Version {
  id: number;
  name: string;
  policies: Policy[];
  contents: ContentsState;
}

export function useResponse(examId: number): ApiResponse<Response> {
  return useApiResponse<Server, Response>(`/api/professor/exams/${examId}`, {}, (res) => ({
    ...res,
    start: DateTime.fromISO(res.start),
    end: DateTime.fromISO(res.end),
  }));
}
