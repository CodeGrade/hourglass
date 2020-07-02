import { MessageType } from '@hourglass/common/api/proctor/messages';

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
