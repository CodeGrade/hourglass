import { hitApi } from '@hourglass/common/types/api';

export interface Body {
  updatedRooms: Array<{
    id: number;
    name: string;
  }>;
  deletedRooms: number[]; // ids
  newRooms: string[]; // names
}

export function updateAll(examId: number, body: Body): Promise<Response> {
  return hitApi(`/api/professor/exams/${examId}/rooms/update_all_rooms`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
