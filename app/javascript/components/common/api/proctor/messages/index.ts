import { DateTime } from 'luxon';
import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';

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
  time: DateTime;
}

interface RoomAnnouncementServer extends RoomAnnouncementShared {
  time: string;
}

interface Server {
  sent: DirectMessageServer[];
  questions: QuestionServer[];
  version: VersionAnnouncementServer[];
  room: RoomAnnouncementServer[];
}

export interface Response {
  sent: DirectMessage[];
  questions: Question[];
  version: VersionAnnouncement[];
  room: RoomAnnouncement[];
}

function convertTime<
  Shared,
  T extends Shared & { time: string }
  >(old: T): Shared & { time: DateTime } {
  return {
    ...old,
    time: DateTime.fromISO(old.time),
  };
}

export function useResponse(examId: number): ApiResponse<Response> {
  return useApiResponse<Server, Response>(`/api/proctor/exams/${examId}/messages`, undefined, (res) => ({
    questions: res.questions.map((a) => convertTime<QuestionShared, QuestionServer>(a)),
    sent: res.sent.map((a) => convertTime<DirectMessageShared, DirectMessageServer>(a)),
    version: res.version.map((a) => convertTime<VersionAnnouncementShared, VersionAnnouncementServer>(a)),
    room: res.room.map((a) => convertTime<RoomAnnouncementShared, RoomAnnouncementServer>(a)),
  }));
}
