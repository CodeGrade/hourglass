import { hitApi } from '@hourglass/common/types/api';

export default function del(versionId: number): Promise<unknown> {
  return hitApi<unknown>(`/api/professor/versions/${versionId}`, {
    method: 'DELETE',
  });
}
