import { hitApi } from '@hourglass/common/types/api';

export interface Response {
  id: number;
}

export function importVersion(examId: number, f: File): Promise<Response> {
  const data = new FormData();
  data.append('upload', f);
  return hitApi<Response>(`/api/professor/exams/${examId}/versions/import`, {
    method: 'POST',
    body: data,
  }, false);
}
