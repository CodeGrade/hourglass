import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';

export interface Exam {
  id: number;
  name: string;
}

export interface RegInfo {
  [regId: number]: {
    exam: Exam;
  };
}

export interface Reg {
  id: number;
}

export interface Response {
  regs: Reg[];
  regInfo: RegInfo;
}

export function useResponse(): ApiResponse<Response> {
  return useApiResponse('/api/student/registrations');
}
