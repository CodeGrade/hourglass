import { createContext, useContext } from 'react';
import {
  FileMap,
  ExamFile,
  ExamInfo,
  RegistrationInfo,
  User,
} from '@hourglass/types';

interface ExamContext {
  files: ExamFile[];
  fmap: FileMap;
}

const EC = createContext<Partial<ExamContext>>({});

export const ExamContextProvider = EC.Provider;
export const useExamContext = () => useContext(EC);

interface ExamInfoContext {
  exam: ExamInfo;
  registration: RegistrationInfo;
  user: User;
  preview: boolean;
}

const EIC = createContext<Partial<ExamInfoContext>>({});

export const ExamInfoContextProvider = EIC.Provider;
export const useExamInfoContext = () => useContext(EIC);
