import { createContext } from 'react';
import {
  FileMap,
  ExamFile,
  AnswersState,
  FileRef,
} from '@student/exams/show/types';
import { ExamRubric } from '@professor/exams/types';

interface IExamContext {
  files: ExamFile[];
  fmap: FileMap;
}
export const ExamContext = createContext<IExamContext>({} as IExamContext);

interface IExamViewerContext {
  answers: AnswersState;
  rubric?: ExamRubric;
}
export const ExamViewerContext = createContext<IExamViewerContext>({} as IExamViewerContext);

interface FilesContext {
  references: readonly FileRef[];
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
