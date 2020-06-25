import { DateTime } from 'luxon';
import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';

export enum MessageType {
  Direct = 'DIRECT',
  Question = 'QUESTION',
  Room = 'ROOM',
  Version = 'VERSION',
  Exam = 'EXAM',
}

interface DirectMessageShared {
  id: number;
  body: string;
  sender: {
    isMe: boolean;
    displayName: string;
  };
  recipient: {
    displayName: string;
  };
}

export interface DirectMessage extends DirectMessageShared {
  type: MessageType.Direct;
  time: DateTime;
}

interface DirectMessageServer extends DirectMessageShared {
  time: string;
}

interface QuestionShared {
  id: number;
  body: string;
  sender: {
    displayName: string;
  };
}

export interface Question extends QuestionShared {
  type: MessageType.Question;
  time: DateTime;
}

interface QuestionServer extends QuestionShared {
  time: string;
}

interface VersionAnnouncementShared {
  id: number;
  version: {
    name: string;
  };
  body: string;
}

export interface VersionAnnouncement extends VersionAnnouncementShared {
  type: MessageType.Version;
  time: DateTime;
}

interface VersionAnnouncementServer extends VersionAnnouncementShared {
  time: string;
}

interface RoomAnnouncementShared {
  id: number;
  room: {
    name: string;
  };
  body: string;
}

export interface RoomAnnouncement extends RoomAnnouncementShared {
  type: MessageType.Room;
  time: DateTime;
}

interface RoomAnnouncementServer extends RoomAnnouncementShared {
  time: string;
}

interface ExamAnnouncementShared {
  id: number;
  body: string;
}

export interface ExamAnnouncement extends ExamAnnouncementShared {
  type: MessageType.Exam;
  time: DateTime;
}

interface ExamAnnouncementServer extends ExamAnnouncementShared {
  time: string;
}

export interface Recipient {
  type: MessageType.Direct | MessageType.Room | MessageType.Version | MessageType.Exam;
  id: number;
  name: string;
}

interface Server {
  sent: DirectMessageServer[];
  questions: QuestionServer[];
  version: VersionAnnouncementServer[];
  room: RoomAnnouncementServer[];
  exam: ExamAnnouncementServer[];
  recipients: {
    rooms: Recipient[];
    students: Recipient[];
    versions: Recipient[];
  }
}

export interface Response {
  sent: DirectMessage[];
  questions: Question[];
  version: VersionAnnouncement[];
  room: RoomAnnouncement[];
  exam: ExamAnnouncement[];
  recipients: {
    rooms: Recipient[];
    students: Recipient[];
    versions: Recipient[];
  }
}

export type Message =
  Question | DirectMessage | VersionAnnouncement | RoomAnnouncement | ExamAnnouncement;

function convertTime<
  MT extends MessageType,
  Shared,
  T extends Shared & { time: string }
>(mt: MT, old: T): Shared & { time: DateTime, type: MT } {
  return {
    ...old,
    type: mt,
    time: DateTime.fromISO(old.time),
  };
}

function convertTimes<
  MT extends MessageType,
  Shared,
  T extends Shared & { time: string }
>(mt: MT, old: T[]): Array<Shared & { time: DateTime, type: MT }> {
  return old.map((a) => convertTime<MT, Shared, T>(mt, a));
}

export function useResponse(examId: number, deps?: React.DependencyList): ApiResponse<Response> {
  return useApiResponse<Server, Response>(`/api/proctor/exams/${examId}/messages`, undefined, (res) => ({
    ...res,
    questions: convertTimes<MessageType.Question, QuestionShared, QuestionServer>(
      MessageType.Question, res.questions,
    ),
    sent: convertTimes<MessageType.Direct, DirectMessageShared, DirectMessageServer>(
      MessageType.Direct,
      res.sent,
    ),
    version: convertTimes<
      MessageType.Version,
      VersionAnnouncementShared,
      VersionAnnouncementServer
    >(
      MessageType.Version,
      res.version,
    ),
    room: convertTimes<MessageType.Room, RoomAnnouncementShared, RoomAnnouncementServer>(
      MessageType.Room,
      res.room,
    ),
    exam: convertTimes<MessageType.Exam, ExamAnnouncementShared, ExamAnnouncementServer>(
      MessageType.Exam,
      res.exam,
    ),
  }), deps);
}
