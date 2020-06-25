import { DateTime } from "luxon";
import { ApiResponse, useApiResponse } from "@hourglass/common/types/api";

interface DirectMessageShared {
  id: number;
  body: string;
  sender: {
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
  direct: DirectMessageServer[];
  version: VersionAnnouncementServer[];
  room: RoomAnnouncementServer[];
}

export interface Response {
  direct: DirectMessage[];
  version: VersionAnnouncement[];
  room: RoomAnnouncement[];
}

function convertTime<Shared, T extends Shared & { time: string }>(old: T): Shared & { time: DateTime } {
  return {
    ...old,
    time: DateTime.fromISO(old.time),
  };
}

export function useResponse(examId: number): ApiResponse<Response> {
  return useApiResponse<Server, Response>(`/exams/${examId}/messages`, undefined, (res) => ({
    direct: res.direct.map((a) => convertTime<DirectMessageShared, DirectMessageServer>(a)),
    version: res.version.map((a) => convertTime<VersionAnnouncementShared, VersionAnnouncementServer>(a)),
    room: res.room.map((a) => convertTime<RoomAnnouncementShared, RoomAnnouncementServer>(a)),
  }));
}
