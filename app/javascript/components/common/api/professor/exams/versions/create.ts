import { hitApi } from '@hourglass/common/types/api';
import { Version } from './update';

export interface VersionWithID extends Version {
  id: number;
}

export default function create(examId: number): Promise<VersionWithID> {
  return hitApi<VersionWithID>(`/api/professor/exams/${examId}/versions`, {
    method: 'POST',
  });
}
