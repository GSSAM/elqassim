
export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin'
}

export enum EducationLevel {
  LEVEL_1 = 'أولى ثانوي',
  LEVEL_2 = 'ثانية ثانوي',
  LEVEL_3 = 'ثالثة ثانوي'
}

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  level: EducationLevel;
  isActive: boolean;
  activationCode: string | null;
  activatedAt: string | null;
  createdAt: string;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  allowedRoles: UserRole[];
  allowedLevels: EducationLevel[];
  contentUrl?: string;
}

export interface ActivationCode {
  code: string;
  role: UserRole;
  level: EducationLevel;
  isUsed: boolean;
  usedBy?: string;
}
