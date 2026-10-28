export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type AcademicStage = 'primary' | 'middle' | 'high' | 'higher-secondary';
export type AcademicStream = 'general' | 'science' | 'arts' | 'vocational';

export interface SchoolConfig {
  schoolName: string;
  schoolNameTamil?: string;
  subTitle: string;
  subTitleTamil?: string;
  academicYear: string;
  days: DayOfWeek[];
  defaultPeriodsPerDay: number;
  periodTimings: {
    period: number;
    startTime: string;
    endTime: string;
    isBreakAfter?: boolean;
    breakLabel?: string;
    breakLabelTamil?: string;
  }[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  tamilName?: string;
  color: string;
  isLab?: boolean;
  isCore?: boolean;
  isECA?: boolean;
  isPractical?: boolean;
  practicalGroup?: 'science' | 'vocational';
}

export interface Teacher {
  id: string;
  code: string; // e.g. T-1, T-2
  name: string;
  nameTamil?: string;
  department: string;
  phone?: string;
  email?: string;
  maxWeeklyLoad: number; // default 28-32
  preferredSubjects?: string[]; // IDs of subjects taught/preferred
  subjectsHandled?: string[]; // Multiple subjects handled across classes (e.g. ['sub-cs', 'sub-es'])
}

export interface ClassSection {
  id: string;
  grade: number; // 1 to 12
  name: string; // "Class 1", "Class 6", "Class 11 - Science", etc.
  nameTamil?: string;
  section: string; // "A", "B", etc.
  stage: AcademicStage;
  stream?: AcademicStream;
  periodsPerDay: number; // Standard 8 periods / day (as per 2026-2027 Tamil Nadu School Education Dept notification)
  roomNumber: string;
  classTeacherId?: string;
}

export interface SubjectPeriodRequirement {
  classId: string;
  subjectId: string;
  assignedPerWeek: number; // target periods per week
  dailyDistribution: Record<DayOfWeek, number>; // e.g. Mon: 2, Tue: 1, etc.
}

export interface ClassSubjectTeacherMapping {
  classId: string;
  subjectId: string;
  teacherId: string;
}

export interface TimetableSlot {
  id: string;
  classId: string;
  day: DayOfWeek;
  period: number; // 1-indexed (1 to 8)
  subjectId: string;
  teacherId: string;
  room?: string;
  isCombined?: boolean;
  combinedClassIds?: string[];
  combinedLabel?: string; // e.g. "11A,B,C", "11AB", "11BE", "12ABC"
  combinedGroupId?: string;
}

export interface ClassCombineRule {
  id: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  classIds: string[];
  label: string; // e.g. "11A,B,C" or "11D"
  periodsPerWeek: number;
  isCombine: boolean; // true for Class Combine, false for Class Individual
  notes?: string;
}

export interface TimetableClash {
  type: 'TEACHER_DOUBLE_BOOKING' | 'OVER_CAPACITY' | 'ROOM_CONFLICT';
  message: string;
  day: DayOfWeek;
  period: number;
  teacherId?: string;
  affectedClassIds: string[];
}

export interface TeacherFreePeriods {
  teacherId: string;
  freePeriodsByDay: Record<DayOfWeek, number[]>;
}

export interface SubstitutionAssignment {
  id: string;
  date: string;
  day: DayOfWeek;
  period: number;
  classId: string;
  subjectId: string;
  originalTeacherId: string;
  substituteTeacherId: string;
  reason: string;
  status: 'assigned' | 'completed' | 'cancelled';
}
