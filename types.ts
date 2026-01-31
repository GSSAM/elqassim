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
  activationCode?: string | null;
  activatedAt?: any;
  createdAt: any;
}

export interface Section {
  id?: string;
  title: string;
  description: string;
  allowedRoles: UserRole[];
  allowedLevels: EducationLevel[];
  icon?: string;
}

export interface ActivationCode {
  code: string;
  level: EducationLevel;
  isUsed: boolean;
  createdAt: string;
  usedBy?: string;
  usedAt?: any;
}