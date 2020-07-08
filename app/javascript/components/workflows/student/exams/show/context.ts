import { createContext } from 'react';
import {
  FileMap,
  ExamFile,
  AnswersState,
  FileRef,
} from '@student/exams/show/types';

interface ExamContext {
  files: ExamFile[];
  fmap: FileMap;
}
export const ExamContext = createContext<ExamContext>({} as ExamContext);

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
