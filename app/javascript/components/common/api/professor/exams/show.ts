import React from 'react';
import { ApiResponse, useApiResponse } from '@hourglass/common/types/api';
import { ContentsState, Policy } from '@student/exams/show/types';
import { DateTime } from 'luxon';

export interface Version {
  id: number;
  name: string;
  policies: Policy[];
  contents: ContentsState;
  anyStarted: boolean;
}

interface Server {
  name: string;
  duration: number;
  start: string;
  end: string;
  versions: Version[];
  checklist: Checklist;
}

export type ChecklistItemStatus = Warning | NotStarted | Complete | NotApplicable;

interface NotStarted {
  type: 'NOT_STARTED';
}
interface Complete {
  type: 'COMPLETE';
}
interface NotApplicable {
  type: 'NA';
}

interface Warning {
  type: 'WARNING';
  reason: string;
}

export interface Checklist {
  staff: {
    status: ChecklistItemStatus;
  };
  seating: {
    status: ChecklistItemStatus;
  };
  versions: {
    status: ChecklistItemStatus;
  };
}

export interface Response extends Omit<Omit<Server, 'start'>, 'end'> {
  start: DateTime;
  end: DateTime;
}

export function useResponse(examId: number, deps: React.DependencyList): ApiResponse<Response> {
  return useApiResponse<Server, Response>(`/api/professor/exams/${examId}`, {}, (res) => ({
    ...res,
    start: DateTime.fromISO(res.start),
    end: DateTime.fromISO(res.end),
  }), deps);
}
