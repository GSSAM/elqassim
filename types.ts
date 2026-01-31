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
  activatedAt?: any;
  createdAt: any;
}

export interface Section {
  id?: string;
  title: string;
  description: string;
  allowedRoles: UserRole[];
  allowedLevels: EducationLevel[];
}