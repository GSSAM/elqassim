
export enum UserRole {
  STUDENT = 'student',
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
  subStart: any;
  subEnd: any;
  createdAt: any;
  lastLogin?: any;
}

export type ContentType = 'lesson' | 'video' | 'live';

export interface EducationalContent {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  level: EducationLevel;
  content: string; // HTML for lessons or URL for video/live
  scheduledAt?: any; // For live streams
  createdAt: any;
}

export interface ActivationCode {
  code: string;
  durationDays: number;
  level: EducationLevel;
  isUsed: boolean;
  usedBy?: string;
  usedByEmail?: string;
  usedAt?: any;
  createdAt: any;
}
