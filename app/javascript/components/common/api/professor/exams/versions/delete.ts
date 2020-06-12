import { hitApi } from '@hourglass/common/types/api';

export default async function del(versionId: number): Promise<unknown> {
  try {
    const res = await hitApi<unknown>(`/api/professor/versions/${versionId}`, {
      method: 'DELETE',
    });
    return res;
  } catch (e) {
    if (e.status === 409) {
      throw new Error('You cannot delete a version that students have started taking.');
    }
    throw e;
  }
}
