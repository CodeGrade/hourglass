import { Recipient } from '@hourglass/common/api/proctor/messages';
import { hitApi } from '@hourglass/common/types/api';

export type Response = Good | Bad;

interface Good {
  success: true;
}

interface Bad {
  success: false;
  reason: string;
}

export function sendMessage(examId: number, recipient: Recipient, body: string): Promise<Response> {
  return hitApi(`/api/proctor/exams/${examId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      message: {
        body,
        recipient: {
          type: recipient.type,
          id: recipient.id,
        },
      },
    }),
  });
}
