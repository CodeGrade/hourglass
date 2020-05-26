export type RegistrationRole = 'student' | 'grader' | 'assistant' | 'professor';

export interface Course {
  id: number;
  name: string;
  role: RegistrationRole;
}
