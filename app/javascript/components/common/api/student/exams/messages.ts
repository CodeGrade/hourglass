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
  examMessagesUrl: string,
  lastMessageIds: LastMessageIDs,
): Promise<Response> {
  return hitApi(examMessagesUrl, {
    method: 'POST',
    body: JSON.stringify({
      lastMessageIds,
    }),
  });
}
