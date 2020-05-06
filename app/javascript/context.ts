import { createContext, useContext } from 'react';
import {
  FileMap,
  ExamFile,
  RailsExam,
  RegistrationInfo,
  RailsUser,
} from '@hourglass/types';

interface ExamContext {
  files: ExamFile[];
  fmap: FileMap;
}

const EC = createContext<ExamContext>({} as ExamContext);

export const ExamContextProvider = EC.Provider;
export const useExamContext = (): ExamContext => useContext(EC);

interface ExamInfoContext {
  exam: RailsExam;
  registration: RegistrationInfo;
  user: RailsUser;
}

const EIC = createContext<ExamInfoContext>({} as ExamInfoContext);

export const ExamInfoContextProvider = EIC.Provider;
export const useExamInfoContext = (): ExamInfoContext => useContext(EIC);
