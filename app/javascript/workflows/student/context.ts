import { createContext } from 'react';
import {
  FileMap,
  ExamFile,
  RailsExam,
  RailsRegistration,
  RailsUser,
  AnswersState,
} from '@student/types';

interface ExamContext {
  files: ExamFile[];
  fmap: FileMap;
}
export const ExamContext = createContext<ExamContext>({} as ExamContext);

interface RailsContext {
  railsExam?: RailsExam;
  railsRegistration?: RailsRegistration;
  railsUser?: RailsUser;
}
export const RailsContext = createContext<RailsContext>({} as RailsContext);

interface ExamViewerContext {
  answers: AnswersState;
}
export const ExamViewerContext = createContext({} as ExamViewerContext);
