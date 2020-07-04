enum MessageType {
  Direct = 'DIRECT',
  Question = 'QUESTION',
  Room = 'ROOM',
  Version = 'VERSION',
  Exam = 'EXAM',
}

export interface Recipient {
  type: MessageType.Direct | MessageType.Room | MessageType.Version | MessageType.Exam;
  id: number;
  realId?: string;
  name: string;
}

export interface SplitRecipients {
  rooms: Recipient[];
  students: Recipient[];
  versions: Recipient[];
}
