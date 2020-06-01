import { hitApi } from '@hourglass/common/types/api';
import { Student } from './index';

export interface Response {
  created: boolean;
}

export interface Registrations {
  [roomId: number]: Array<Student['id']>;
}

export function updateAll(examId: number, regs: Registrations): Promise<Response> {
  return hitApi(`/api/professor/exams/${examId}/rooms/update_all`, {
    method: 'POST',
    body: JSON.stringify({
      registrations: regs,
    }),
  });
}
