import type { User } from 'firebase/auth';

export type UserRole = 'admin' | 'staff' | 'student';

export interface UserProfile extends User {
  role: UserRole;
  department?: string;
}

export interface Activity {
  id: string;
  studentId: string;
  studentName: string;
  description: string;
  sdgGoals: number[];
  documentationLinks: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: {
    seconds: number;
    nanoseconds: number;
  } | Date;
  verifiedBy?: string;
  verifiedAt?: Date;
  feedback?: string;
  points: number;
}
