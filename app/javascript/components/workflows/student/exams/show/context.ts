import { createContext } from 'react';
import {
  FileMap,
  ExamFile,
  RailsExam,
  RailsRegistration,
  RailsUser,
  RailsCourse,
  AnswersState,
} from '@student/exams/show/types';

interface ExamContext {
  files: ExamFile[];
  fmap: FileMap;
}
export const ExamContext = createContext<ExamContext>({} as ExamContext);

interface RailsContext {
  railsExam?: RailsExam;
  railsRegistration?: RailsRegistration;
  railsUser?: RailsUser;
  railsCourse?: RailsCourse;
}
export const RailsContext = createContext<RailsContext>({} as RailsContext);

interface ExamViewerContext {
  answers: AnswersState;
}
export const ExamViewerContext = createContext({} as ExamViewerContext);
