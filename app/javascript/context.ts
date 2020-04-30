import { createContext, useContext } from 'react';
import { FileMap, Files } from './types';

interface ExamCtxt {
  files: Files;
  fmap: FileMap;
  id: number;
}

const ExamContext = createContext<Partial<ExamCtxt>>({});

export const ExamContextProvider = ExamContext.Provider;
export const useExamContext = () => useContext(ExamContext);
