import { createContext } from 'react';
import {
  FileMap,
  ExamFile,
  RailsExamVersion,
  RailsUser,
  AnswersState,
  FileRef,
} from '@student/exams/show/types';
import { DateTime } from 'luxon';

interface ExamContext {
  files: ExamFile[];
  fmap: FileMap;
}
export const ExamContext = createContext<ExamContext>({} as ExamContext);

interface RailsContext {
  railsExam: RailsExamVersion;
  anomalous: boolean;
  over: boolean;
  lastSnapshot: DateTime;
  railsUser: RailsUser;
}
export const RailsContext = createContext<RailsContext>({} as RailsContext);

interface ExamViewerContext {
  answers: AnswersState;
}
export const ExamViewerContext = createContext<ExamViewerContext>({} as ExamViewerContext);


interface FilesContext {
  references: FileRef[];
}

export const ExamFilesContext = createContext<FilesContext>({
  references: [],
});

export const QuestionFilesContext = createContext<FilesContext>({
  references: [],
});

export const PartFilesContext = createContext<FilesContext>({
  references: [],
});
