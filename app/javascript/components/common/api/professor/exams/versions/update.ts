import {
  ExamVersion,
  RailsExamVersion,
  AnswersState,
} from '@student/exams/show/types';
import { hitApi } from '@hourglass/common/types/api';

export interface Version {
  // TODO: name: string;
  info: {
    policies: RailsExamVersion['policies'];
    answers: AnswersState['answers'];
    contents: {
      instructions: ExamVersion['instructions'];
      questions: ExamVersion['questions'];
      reference: ExamVersion['reference'];
    };
  };
  files: ExamVersion['files'];
}

export interface Request {
  version: Version;
}

export type Response = Good | Bad;

interface Good {
  updated: true;
}

interface Bad {
  updated: false;
  reason: string;
}

export function versionUpdate(versionId: number, info: Request): Promise<Response> {
  return hitApi<Response>(`/api/professor/versions/${versionId}`, {
    method: 'PATCH',
    body: JSON.stringify(info),
  });
}
