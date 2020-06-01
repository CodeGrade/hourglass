import { hitApi } from '@hourglass/common/types/api';
import { Student } from './index';

export interface Response {
  created: boolean;
}

interface Body {
  unassigned: Array<Student['id']>;
  rooms: {
    [roomId: number]: Array<Student['id']>;
  };
}

export function updateAll(examId: number, body: Body): Promise<Response> {
  return hitApi(`/api/professor/exams/${examId}/rooms/update_all`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
