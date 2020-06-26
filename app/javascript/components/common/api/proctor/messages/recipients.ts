import React from 'react';
import { MessageType } from '@hourglass/common/api/proctor/messages';
import { useApiResponse, ApiResponse } from '@hourglass/common/types/api';

export interface Recipient {
  type: MessageType.Direct | MessageType.Room | MessageType.Version | MessageType.Exam;
  id: number;
  name: string;
}

export interface SplitRecipients {
  rooms: Recipient[];
  students: Recipient[];
  versions: Recipient[];
}

export interface Response {
  recipients: SplitRecipients;
}

export function useMessageRecipients(
  examId: number,
  deps?: React.DependencyList,
): ApiResponse<Response> {
  return useApiResponse(`/api/proctor/exams/${examId}/messages/recipients`, undefined, undefined, deps);
}
