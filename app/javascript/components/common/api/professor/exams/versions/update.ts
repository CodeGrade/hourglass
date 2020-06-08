import {
  Exam,
  RailsExam,
  AnswersState,
} from '@student/exams/show/types';
import { hitApi } from '@hourglass/common/types/api';

export interface Version {
  info: {
    policies: RailsExam['policies'];
    answers: AnswersState['answers'];
    contents: {
      instructions: Exam['instructions'];
      questions: Exam['questions'];
      reference: Exam['reference'];
    };
  };
  files: Exam['files'];
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
