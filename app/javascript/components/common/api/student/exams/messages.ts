import { RailsExamMessage } from '@student/exams/show/types';
import { hitApi } from '@hourglass/common/types/api';

export interface Response {
  messages: {
    personal: RailsExamMessage[];
    room: RailsExamMessage[];
    version: RailsExamMessage[];
    exam: RailsExamMessage[];
  };
}

interface LastMessageIDs {
  personal: number;
  room: number;
  version: number;
  exam: number;
}

export function getLatestMessages(
  examId: number,
  lastMessageIds: LastMessageIDs,
): Promise<Response> {
  return hitApi(`/api/student/exams/${examId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      lastMessageIds,
    }),
  });
}
