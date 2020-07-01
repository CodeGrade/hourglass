import { useApiResponse, ApiResponse } from '@hourglass/common/types/api';

interface Exam {
  id: number;
  name: string;
}

interface Course {
  id: number;
  exams: Exam[];
}

export interface StaffRegistration {
  id: number;
  course: Course;
}

interface Response {
  regs: StaffRegistration[];
}

export function useStaffRegistrationsIndex(): ApiResponse<Response> {
  return useApiResponse('/api/grader/staff_registrations');
}
