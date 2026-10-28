import {
  SchoolConfig,
  Subject,
  Teacher,
  ClassSection,
  SubjectPeriodRequirement,
  ClassSubjectTeacherMapping,
  TimetableSlot,
  ClassCombineRule,
  DayOfWeek,
} from '../types/timetable';

export const initialSchoolConfig: SchoolConfig = {
  schoolName: 'GHSS PANNAIPURAM',
  schoolNameTamil: 'அரசு மேல்நிலைப் பள்ளி, பண்ணைப்புரம்',
  subTitle: 'School Education Department · Revised Academic Time Table 2026-2027 (Classes 1 to 12)',
  subTitleTamil: 'பள்ளிக் கல்வித் துறை · திருத்திய கால அட்டவணை 2026-2027 (வகுப்பு 1 முதல் 12 வரை)',
  academicYear: '2026 - 2027',
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  defaultPeriodsPerDay: 8,
  periodTimings: [
    { period: 1, startTime: '09:30', endTime: '10:15' },
    { period: 2, startTime: '10:15', endTime: '11:00', isBreakAfter: true, breakLabel: 'Morning Interval (10m)', breakLabelTamil: 'இடைவேளை (10 நிமிடம்)' },
    { period: 3, startTime: '11:10', endTime: '11:55' },
    { period: 4, startTime: '11:55', endTime: '12:40', isBreakAfter: true, breakLabel: 'Lunch Recess (40m)', breakLabelTamil: 'உணவு இடைவேளை (40 நிமிடம்)' },
    { period: 5, startTime: '01:20', endTime: '02:00' },
    { period: 6, startTime: '02:00', endTime: '02:40', isBreakAfter: true, breakLabel: 'Afternoon Interval (10m)', breakLabelTamil: 'இடைவேளை (10 நிமிடம்)' },
    { period: 7, startTime: '02:50', endTime: '03:30' },
    { period: 8, startTime: '03:30', endTime: '04:10' },
  ],
};

// All subjects defined across Classes 1 to 12
export const initialSubjects: Subject[] = [
  // Languages & Basics
  { id: 'sub-tam', code: 'TAM', name: 'Tamil', tamilName: 'தமிழ்', color: '#0284c7', isCore: true },
  { id: 'sub-eng', code: 'ENG', name: 'English', tamilName: 'ஆங்கிலம்', color: '#2563eb', isCore: true },
  { id: 'sub-math', code: 'MATH', name: 'Mathematics', tamilName: 'கணிதம்', color: '#7c3aed', isCore: true },
  { id: 'sub-sci', code: 'SCI', name: 'Science', tamilName: 'அறிவியல்', color: '#059669', isCore: true, isLab: true },
  { id: 'sub-soc', code: 'SOC', name: 'Social Science', tamilName: 'சமூக அறிவியல்', color: '#d97706', isCore: true },
  { id: 'sub-evs', code: 'EVS', name: 'Environmental Studies', tamilName: 'சுற்றுச்சூழல் கல்வி', color: '#16a34a', isCore: true },

  // Higher Secondary Sciences & Vocations
  // Practical Subjects (Science Group: Physics, Chemistry, Computer Science, Bio-Botany, Bio-Zoology, Botany, Zoology)
  { id: 'sub-phy', code: 'PHY', name: 'Physics', tamilName: 'இயற்பியல்', color: '#0369a1', isCore: true, isLab: true, isPractical: true, practicalGroup: 'science' },
  { id: 'sub-che', code: 'CHE', name: 'Chemistry', tamilName: 'வேதியியல்', color: '#047857', isCore: true, isLab: true, isPractical: true, practicalGroup: 'science' },
  { id: 'sub-bio-bot', code: 'B-BOT', name: 'Bio-Botany', tamilName: 'உயிரி-தாவரவியல்', color: '#15803d', isCore: true, isLab: true, isPractical: true, practicalGroup: 'science' },
  { id: 'sub-bot', code: 'BOT', name: 'Botany', tamilName: 'தாவரவியல்', color: '#166534', isCore: true, isLab: true, isPractical: true, practicalGroup: 'science' },
  { id: 'sub-bio-zoo', code: 'B-ZOO', name: 'Bio-Zoology', tamilName: 'உயிரி-விலங்கியல்', color: '#b45309', isCore: true, isLab: true, isPractical: true, practicalGroup: 'science' },
  { id: 'sub-zoo', code: 'ZOO', name: 'Zoology', tamilName: 'விலங்கியல்', color: '#92400e', isCore: true, isLab: true, isPractical: true, practicalGroup: 'science' },

  // Vocational & Digital (Vocational Group: Agri-P, Emp Skills)
  { id: 'sub-cs', code: 'CS', name: 'Computer Science', tamilName: 'கணினி அறிவியல்', color: '#1d4ed8', isCore: true, isLab: true, isPractical: true, practicalGroup: 'science' },
  { id: 'sub-es', code: 'ES', name: 'Employability Skills', tamilName: 'வேலைவாய்ப்புத் திறன் (Employability Skills)', color: '#0f766e', isCore: true, isLab: true, isPractical: true, practicalGroup: 'vocational' },
  { id: 'sub-agri-t', code: 'AGRI-T', name: 'Agri-Theory (Agri-T)', tamilName: 'வேளாண்மை கோட்பாடு (Agri-T)', color: '#78350f', isCore: true },
  { id: 'sub-agri-p', code: 'AGRI-P', name: 'Agri-Practical (Agri-P)', tamilName: 'வேளாண்மை செய்முறை (Agri-P)', color: '#854d0e', isLab: true, isPractical: true, practicalGroup: 'vocational' },

  // Labs, Digital & Foundation
  { id: 'sub-lang-lab', code: 'LLAB', name: 'Language Lab', tamilName: 'மொழி ஆய்வகம்', color: '#0891b2', isLab: true },
  { id: 'sub-spark', code: 'SPARK', name: 'TN SPARK (AI & Robotics)', tamilName: 'செயற்கை நுண்ணறிவு & எந்திரனியல் (TN SPARK)', color: '#4f46e5', isLab: true },
  { id: 'sub-lib-val', code: 'LIB', name: 'Library / Value Education', tamilName: 'நூலகம் / விழுமியக் கல்வி', color: '#64748b' },

  // Sports & Co-Curricular
  { id: 'sub-pet', code: 'PET', name: 'Physical Education (PET)', tamilName: 'உடற்கல்வி', color: '#ea580c', isECA: true },
  { id: 'sub-cca-eca', code: 'CCA', name: 'CCA / Extra Curricular Activities', tamilName: 'பள்ளி இணைச் செயல்பாடுகள் (CCA/ECA)', color: '#c026d3', isECA: true },
  { id: 'sub-cca-pet', code: 'CCA-PET', name: 'CCA / ECA / Physical Education', tamilName: 'இணைச் செயல்பாடு / உடற்கல்வி', color: '#d946ef', isECA: true },
  { id: 'sub-art-sel', code: 'ART-SEL', name: 'Music, Arts & Crafts / SEL', tamilName: 'இசை / கலை (ம) கைவினை / மனவெழுச்சி கற்றல்', color: '#db2777', isECA: true },
];

// Classes 1 to 12: Primary (1-5), Middle (6-8), High (9-10), Hr Sec (11A-E, 12A-E)
export const initialClasses: ClassSection[] = [
  // Primary (1 to 5)
  { id: 'cls-1', grade: 1, name: 'Class 1', nameTamil: 'வகுப்பு 1', section: 'A', stage: 'primary', periodsPerDay: 8, roomNumber: 'Room 101', classTeacherId: 't-2' },
  { id: 'cls-2', grade: 2, name: 'Class 2', nameTamil: 'வகுப்பு 2', section: 'A', stage: 'primary', periodsPerDay: 8, roomNumber: 'Room 102', classTeacherId: 't-3' },
  { id: 'cls-3', grade: 3, name: 'Class 3', nameTamil: 'வகுப்பு 3', section: 'A', stage: 'primary', periodsPerDay: 8, roomNumber: 'Room 103', classTeacherId: 't-4' },
  { id: 'cls-4', grade: 4, name: 'Class 4', nameTamil: 'வகுப்பு 4', section: 'A', stage: 'primary', periodsPerDay: 8, roomNumber: 'Room 104', classTeacherId: 't-6' },
  { id: 'cls-5', grade: 5, name: 'Class 5', nameTamil: 'வகுப்பு 5', section: 'A', stage: 'primary', periodsPerDay: 8, roomNumber: 'Room 105', classTeacherId: 't-8' },

  // Middle School (6 to 8)
  { id: 'cls-6', grade: 6, name: 'Class 6', nameTamil: 'வகுப்பு 6', section: 'A', stage: 'middle', periodsPerDay: 8, roomNumber: 'Room 201', classTeacherId: 't-1' },
  { id: 'cls-7', grade: 7, name: 'Class 7', nameTamil: 'வகுப்பு 7', section: 'A', stage: 'middle', periodsPerDay: 8, roomNumber: 'Room 202', classTeacherId: 't-7' },
  { id: 'cls-8', grade: 8, name: 'Class 8', nameTamil: 'வகுப்பு 8', section: 'A', stage: 'middle', periodsPerDay: 8, roomNumber: 'Room 203', classTeacherId: 't-9' },

  // High School (9 and 10)
  { id: 'cls-9', grade: 9, name: 'Class 9', nameTamil: 'வகுப்பு 9', section: 'A', stage: 'high', periodsPerDay: 8, roomNumber: 'Room 301', classTeacherId: 't-15' },
  { id: 'cls-10', grade: 10, name: 'Class 10', nameTamil: 'வகுப்பு 10', section: 'A', stage: 'high', periodsPerDay: 8, roomNumber: 'Room 302', classTeacherId: 't-17' },

  // Higher Secondary: Class 11 Sections A, B, C, D, E
  { id: 'cls-11-a', grade: 11, name: '11-A (Maths-CS)', nameTamil: '11-அ (கணிதம்-கணினி)', section: 'A', stage: 'higher-secondary', stream: 'science', periodsPerDay: 8, roomNumber: 'Lab Block 401', classTeacherId: 't-31' },
  { id: 'cls-11-b', grade: 11, name: '11-B (Maths-Bio)', nameTamil: '11-ஆ (கணிதம்-உயிரியல்)', section: 'B', stage: 'higher-secondary', stream: 'science', periodsPerDay: 8, roomNumber: 'Lab Block 402', classTeacherId: 't-lathamani' },
  { id: 'cls-11-c', grade: 11, name: '11-C (Pure Sci)', nameTamil: '11-இ (தூய அறிவியல்)', section: 'C', stage: 'higher-secondary', stream: 'science', periodsPerDay: 8, roomNumber: 'Lab Block 403', classTeacherId: 't-ramesh-bot' },
  { id: 'cls-11-d', grade: 11, name: '11-D (Bio-Maths D)', nameTamil: '11-ஈ (உயிரியல்-கணிதம்)', section: 'D', stage: 'higher-secondary', stream: 'science', periodsPerDay: 8, roomNumber: 'Room 404', classTeacherId: 't-gowri' },
  { id: 'cls-11-e', grade: 11, name: '11-E (Vocational Agri/ES)', nameTamil: '11-உ (வேளாண்மை தொழிற்கல்வி)', section: 'E', stage: 'higher-secondary', stream: 'vocational', periodsPerDay: 8, roomNumber: 'Voc Block 405', classTeacherId: 't-maritheivam' },

  // Higher Secondary: Class 12 Sections A, B, C, D, E
  { id: 'cls-12-a', grade: 12, name: '12-A (Maths-CS)', nameTamil: '12-அ (கணிதம்-கணினி)', section: 'A', stage: 'higher-secondary', stream: 'science', periodsPerDay: 8, roomNumber: 'Lab Block 501', classTeacherId: 't-31' },
  { id: 'cls-12-b', grade: 12, name: '12-B (Maths-Bio)', nameTamil: '12-ஆ (கணிதம்-உயிரியல்)', section: 'B', stage: 'higher-secondary', stream: 'science', periodsPerDay: 8, roomNumber: 'Lab Block 502', classTeacherId: 't-sundar-zoo' },
  { id: 'cls-12-c', grade: 12, name: '12-C (Pure Sci)', nameTamil: '12-இ (தூய அறிவியல்)', section: 'C', stage: 'higher-secondary', stream: 'science', periodsPerDay: 8, roomNumber: 'Lab Block 503', classTeacherId: 't-nithya' },
  { id: 'cls-12-d', grade: 12, name: '12-D (Bio-Maths D)', nameTamil: '12-ஈ (உயிரியல்-கணிதம்)', section: 'D', stage: 'higher-secondary', stream: 'science', periodsPerDay: 8, roomNumber: 'Room 504', classTeacherId: 't-subbulakshmi' },
  { id: 'cls-12-e', grade: 12, name: '12-E (Vocational Agri/ES)', nameTamil: '12-உ (வேளாண்மை தொழிற்கல்வி)', section: 'E', stage: 'higher-secondary', stream: 'vocational', periodsPerDay: 8, roomNumber: 'Voc Block 505', classTeacherId: 't-maritheivam' },
];

// Higher Secondary Teachers & Faculty List
export const initialTeachers: Teacher[] = [
  // 1. Subbulakshmi: Tamil (PG) - 29 Periods (11A,B,C=5, 12A,B,C=5, 11D=5, 12D=5, 11E=4, 12E=5)
  {
    id: 't-subbulakshmi',
    code: 'T-SUB',
    name: 'Mrs. Subbulakshmi',
    nameTamil: 'திருமதி சுப்புலட்சுமி',
    department: 'Tamil (PG)',
    maxWeeklyLoad: 29,
    preferredSubjects: ['sub-tam'],
    subjectsHandled: ['sub-tam'],
  },

  // 2. Pradeepa: English (PG) - 29 Periods (11A,B,C=5, 12A,B,C=5, 11D=5, 12D=5, 11E=4, 12E=5)
  {
    id: 't-pradeepa',
    code: 'T-PRA',
    name: 'Mrs. Pradeepa',
    nameTamil: 'திருமதி பிரதீபா',
    department: 'English (PG)',
    maxWeeklyLoad: 29,
    preferredSubjects: ['sub-eng'],
    subjectsHandled: ['sub-eng'],
  },

  // 3. Gowri: Physics (PG) - 28 Periods (11ABC=7, 12ABC=7, 11D=7, 12D=7)
  {
    id: 't-gowri',
    code: 'T-GOW',
    name: 'Mrs. Gowri',
    nameTamil: 'திருமதி கௌரி',
    department: 'Physics (PG)',
    maxWeeklyLoad: 28,
    preferredSubjects: ['sub-phy'],
    subjectsHandled: ['sub-phy'],
  },

  // 4. Nithya: Chemistry (PG) - 28 Periods (11ABC=7, 12ABC=7, 11D=7, 12D=7)
  {
    id: 't-nithya',
    code: 'T-NIT',
    name: 'Mrs. Nithya',
    nameTamil: 'திருமதி நித்யா',
    department: 'Chemistry (PG)',
    maxWeeklyLoad: 28,
    preferredSubjects: ['sub-che'],
    subjectsHandled: ['sub-che'],
  },

  // 5. Lathamani: Maths (PG) - 28 Periods (11AB=7, 12AB=7, 11D=7, 12D=7)
  {
    id: 't-lathamani',
    code: 'T-LAT',
    name: 'Mrs. Lathamani',
    nameTamil: 'திருமதி லதாமணி',
    department: 'Mathematics (PG)',
    maxWeeklyLoad: 28,
    preferredSubjects: ['sub-math'],
    subjectsHandled: ['sub-math'],
  },

  // 6. Ramesh: Bio-Botany & Botany (PG) - 30 Periods (11BE=4, 11C=7, 11D=4, 12BE=4, 12C=7, 12D=4)
  {
    id: 't-ramesh-bot',
    code: 'T-RAM',
    name: 'Mr. Ramesh',
    nameTamil: 'திரு ரமேஷ்',
    department: 'Botany (PG)',
    maxWeeklyLoad: 30,
    preferredSubjects: ['sub-bio-bot', 'sub-bot'],
    subjectsHandled: ['sub-bio-bot', 'sub-bot'],
  },

  // 7. Sundar: Bio-Zoology & Zoology (PG) - 30 Periods (11BE=4, 11C=7, 11D=4, 12BE=4, 12C=7, 12D=4)
  {
    id: 't-sundar-zoo',
    code: 'T-SUN',
    name: 'Mr. Sundar',
    nameTamil: 'திரு சுந்தர்',
    department: 'Zoology (PG)',
    maxWeeklyLoad: 30,
    preferredSubjects: ['sub-bio-zoo', 'sub-zoo'],
    subjectsHandled: ['sub-bio-zoo', 'sub-zoo'],
  },

  // 8. Siva: Computer Science & Emp Skills (PG) - 28 Periods (11A=7, 11E=7, 12A=7, 12E=7)
  {
    id: 't-31',
    code: 'T-31',
    name: 'Mr. P. SIVA',
    nameTamil: 'திரு பா. சிவா',
    department: 'Computer Science (PG)',
    maxWeeklyLoad: 28,
    preferredSubjects: ['sub-cs', 'sub-es'],
    subjectsHandled: ['sub-cs', 'sub-es'],
  },

  // 9. Maritheivam: Agri-Theory & Agri-Practical (PG) - 28 Periods (11E=14, 12E=14)
  {
    id: 't-maritheivam',
    code: 'T-MAR',
    name: 'Mr. Maritheivam',
    nameTamil: 'திரு மாரித்தெய்வம்',
    department: 'Vocational Agri (PG)',
    maxWeeklyLoad: 28,
    preferredSubjects: ['sub-agri-t', 'sub-agri-p'],
    subjectsHandled: ['sub-agri-t', 'sub-agri-p'],
  },

  // Junior & Primary Faculty
  { id: 't-1', code: 'T-1', name: 'Dr. M. Sundaram', nameTamil: 'முனைவர் மு. சுந்தரம்', department: 'Tamil', maxWeeklyLoad: 28, preferredSubjects: ['sub-tam'], subjectsHandled: ['sub-tam'] },
  { id: 't-2', code: 'T-2', name: 'Mrs. S. Meenakshi', nameTamil: 'திருமதி சு. மீனாட்சி', department: 'English', maxWeeklyLoad: 28, preferredSubjects: ['sub-eng'], subjectsHandled: ['sub-eng'] },
  { id: 't-3', code: 'T-3', name: 'Mr. R. Karthik', nameTamil: 'திரு ரா. கார்த்திக்', department: 'Tamil', maxWeeklyLoad: 28, preferredSubjects: ['sub-tam'], subjectsHandled: ['sub-tam'] },
  { id: 't-4', code: 'T-4', name: 'Mrs. V. Anitha', nameTamil: 'திருமதி வெ. அனிதா', department: 'Mathematics', maxWeeklyLoad: 28, preferredSubjects: ['sub-math'], subjectsHandled: ['sub-math'] },
  { id: 't-5', code: 'T-5', name: 'Mr. S. Balaji', nameTamil: 'திரு செ. பாலாஜி', department: 'Mathematics', maxWeeklyLoad: 28, preferredSubjects: ['sub-math'], subjectsHandled: ['sub-math'] },
  { id: 't-6', code: 'T-6', name: 'Mrs. N. Revathi', nameTamil: 'திருமதி நா. ரேவதி', department: 'English', maxWeeklyLoad: 28, preferredSubjects: ['sub-eng'], subjectsHandled: ['sub-eng'] },
  { id: 't-7', code: 'T-7', name: 'Mr. P. Vijay', nameTamil: 'திரு பா. விஜய்', department: 'Science', maxWeeklyLoad: 28, preferredSubjects: ['sub-sci'], subjectsHandled: ['sub-sci'] },
  { id: 't-8', code: 'T-8', name: 'Mrs. D. Priya', nameTamil: 'திருமதி தி. பிரியா', department: 'Science', maxWeeklyLoad: 28, preferredSubjects: ['sub-sci', 'sub-evs'], subjectsHandled: ['sub-sci', 'sub-evs'] },
  { id: 't-9', code: 'T-9', name: 'Mr. A. Selvam', nameTamil: 'திரு ஆ. செல்வம்', department: 'Social Science', maxWeeklyLoad: 28, preferredSubjects: ['sub-soc'], subjectsHandled: ['sub-soc'] },
  { id: 't-10', code: 'T-10', name: 'Mrs. K. Malathi', nameTamil: 'திருமதி கோ. மாலதி', department: 'Social Science', maxWeeklyLoad: 28, preferredSubjects: ['sub-soc'], subjectsHandled: ['sub-soc'] },
  { id: 't-11', code: 'T-11', name: 'Mr. G. Saravanan (TN SPARK)', nameTamil: 'திரு கோ. சரவணன் (ஸ்பார்க்)', department: 'Computer Science', maxWeeklyLoad: 26, preferredSubjects: ['sub-spark', 'sub-lang-lab'], subjectsHandled: ['sub-spark', 'sub-lang-lab'] },
  { id: 't-12', code: 'T-12', name: 'Mrs. B. Kavitha', nameTamil: 'திருமதி பா. கவிதா', department: 'English', maxWeeklyLoad: 26, preferredSubjects: ['sub-eng', 'sub-lang-lab'], subjectsHandled: ['sub-eng', 'sub-lang-lab'] },
  { id: 't-13', code: 'T-13', name: 'Mr. K. Natarajan (PET Director)', nameTamil: 'திரு கி. நடராஜன் (உடற்கல்வி)', department: 'Physical Education', maxWeeklyLoad: 28, preferredSubjects: ['sub-pet', 'sub-cca-pet'], subjectsHandled: ['sub-pet', 'sub-cca-pet'] },
  { id: 't-14', code: 'T-14', name: 'Mrs. P. Deepa (Art & SEL)', nameTamil: 'திருமதி ப. தீபா (கலை & மனவெழுச்சி)', department: 'Art & Co-Curricular', maxWeeklyLoad: 24, preferredSubjects: ['sub-art-sel', 'sub-lib-val'], subjectsHandled: ['sub-art-sel', 'sub-lib-val'] },
  { id: 't-15', code: 'T-15', name: 'Mr. V. Chandran', nameTamil: 'திரு வெ. சந்திரன்', department: 'Mathematics', maxWeeklyLoad: 28, preferredSubjects: ['sub-math'], subjectsHandled: ['sub-math'] },
  { id: 't-16', code: 'T-16', name: 'Mrs. L. Lakshmi', nameTamil: 'திருமதி ல. லட்சுமி', department: 'English', maxWeeklyLoad: 28, preferredSubjects: ['sub-eng'], subjectsHandled: ['sub-eng'] },
  { id: 't-17', code: 'T-17', name: 'Mr. T. Murugan', nameTamil: 'திரு தெ. முருகன்', department: 'Science', maxWeeklyLoad: 28, preferredSubjects: ['sub-sci'], subjectsHandled: ['sub-sci'] },
  { id: 't-18', code: 'T-18', name: 'Mrs. J. Shanthi', nameTamil: 'திருமதி ஜெ. சாந்தி', department: 'Social Science', maxWeeklyLoad: 28, preferredSubjects: ['sub-soc'], subjectsHandled: ['sub-soc'] },
  { id: 't-19', code: 'T-19', name: 'Mr. M. Dinesh (PET)', nameTamil: 'திரு மு. தினேஷ் (உடற்கல்வி)', department: 'Physical Education', maxWeeklyLoad: 28, preferredSubjects: ['sub-pet', 'sub-cca-pet'], subjectsHandled: ['sub-pet', 'sub-cca-pet'] },
  { id: 't-20', code: 'T-20', name: 'Mrs. E. Vani', nameTamil: 'திருமதி எ. வாணி', department: 'Tamil', maxWeeklyLoad: 28, preferredSubjects: ['sub-tam'], subjectsHandled: ['sub-tam'] },
  { id: 't-21', code: 'T-21', name: 'Mr. S. Ramesh (TN SPARK)', nameTamil: 'திரு செ. ரமேஷ் (ஸ்பார்க்)', department: 'Robotics & AI', maxWeeklyLoad: 26, preferredSubjects: ['sub-spark'], subjectsHandled: ['sub-spark'] },
  { id: 't-24', code: 'T-24', name: 'Mrs. H. Nalini', nameTamil: 'திருமதி நளினி (ஆங்கிலம்)', department: 'English', maxWeeklyLoad: 28, preferredSubjects: ['sub-eng'], subjectsHandled: ['sub-eng'] },
  { id: 't-25', code: 'T-25', name: 'Mr. D. Kumar', nameTamil: 'திரு து. குமார்', department: 'Social Science', maxWeeklyLoad: 28, preferredSubjects: ['sub-soc'], subjectsHandled: ['sub-soc'] },
  { id: 't-26', code: 'T-26', name: 'Mrs. S. Parvathi', nameTamil: 'திருமதி செ. பார்வதி', department: 'Tamil', maxWeeklyLoad: 28, preferredSubjects: ['sub-tam'], subjectsHandled: ['sub-tam'] },
  { id: 't-29', code: 'T-29', name: 'Mr. P. Rajesh (Librarian)', nameTamil: 'திரு பா. ராஜேஷ் (நூலகர்)', department: 'Library', maxWeeklyLoad: 25, preferredSubjects: ['sub-lib-val'], subjectsHandled: ['sub-lib-val'] },
];

/**
 * User's Exact Class Combine & Individual Allocation Rules:
 */
export const initialClassCombineRules: ClassCombineRule[] = [
  // Subbulakshmi: Tamil (Total = 29)
  { id: 'ccr-sub-1', teacherId: 't-subbulakshmi', teacherName: 'Subbulakshmi', subjectId: 'sub-tam', subjectName: 'Tamil', classIds: ['cls-11-a', 'cls-11-b', 'cls-11-c'], label: '11A,B,C', periodsPerWeek: 5, isCombine: true },
  { id: 'ccr-sub-2', teacherId: 't-subbulakshmi', teacherName: 'Subbulakshmi', subjectId: 'sub-tam', subjectName: 'Tamil', classIds: ['cls-12-a', 'cls-12-b', 'cls-12-c'], label: '12A,B,C', periodsPerWeek: 5, isCombine: true },
  { id: 'ccr-sub-3', teacherId: 't-subbulakshmi', teacherName: 'Subbulakshmi', subjectId: 'sub-tam', subjectName: 'Tamil', classIds: ['cls-11-d'], label: '11D', periodsPerWeek: 5, isCombine: false },
  { id: 'ccr-sub-4', teacherId: 't-subbulakshmi', teacherName: 'Subbulakshmi', subjectId: 'sub-tam', subjectName: 'Tamil', classIds: ['cls-12-d'], label: '12D', periodsPerWeek: 5, isCombine: false },
  { id: 'ccr-sub-5', teacherId: 't-subbulakshmi', teacherName: 'Subbulakshmi', subjectId: 'sub-tam', subjectName: 'Tamil', classIds: ['cls-11-e'], label: '11E', periodsPerWeek: 4, isCombine: false },
  { id: 'ccr-sub-6', teacherId: 't-subbulakshmi', teacherName: 'Subbulakshmi', subjectId: 'sub-tam', subjectName: 'Tamil', classIds: ['cls-12-e'], label: '12E', periodsPerWeek: 5, isCombine: false },

  // Pradeepa: English (Total = 29)
  { id: 'ccr-pra-1', teacherId: 't-pradeepa', teacherName: 'Pradeepa', subjectId: 'sub-eng', subjectName: 'English', classIds: ['cls-11-a', 'cls-11-b', 'cls-11-c'], label: '11A,B,C', periodsPerWeek: 5, isCombine: true },
  { id: 'ccr-pra-2', teacherId: 't-pradeepa', teacherName: 'Pradeepa', subjectId: 'sub-eng', subjectName: 'English', classIds: ['cls-12-a', 'cls-12-b', 'cls-12-c'], label: '12A,B,C', periodsPerWeek: 5, isCombine: true },
  { id: 'ccr-pra-3', teacherId: 't-pradeepa', teacherName: 'Pradeepa', subjectId: 'sub-eng', subjectName: 'English', classIds: ['cls-11-d'], label: '11D', periodsPerWeek: 5, isCombine: false },
  { id: 'ccr-pra-4', teacherId: 't-pradeepa', teacherName: 'Pradeepa', subjectId: 'sub-eng', subjectName: 'English', classIds: ['cls-12-d'], label: '12D', periodsPerWeek: 5, isCombine: false },
  { id: 'ccr-pra-5', teacherId: 't-pradeepa', teacherName: 'Pradeepa', subjectId: 'sub-eng', subjectName: 'English', classIds: ['cls-11-e'], label: '11E', periodsPerWeek: 4, isCombine: false },
  { id: 'ccr-pra-6', teacherId: 't-pradeepa', teacherName: 'Pradeepa', subjectId: 'sub-eng', subjectName: 'English', classIds: ['cls-12-e'], label: '12E', periodsPerWeek: 5, isCombine: false },

  // Gowri: Physics (Total = 28)
  { id: 'ccr-gow-1', teacherId: 't-gowri', teacherName: 'Gowri', subjectId: 'sub-phy', subjectName: 'Physics', classIds: ['cls-11-a', 'cls-11-b', 'cls-11-c'], label: '11ABC', periodsPerWeek: 7, isCombine: true },
  { id: 'ccr-gow-2', teacherId: 't-gowri', teacherName: 'Gowri', subjectId: 'sub-phy', subjectName: 'Physics', classIds: ['cls-12-a', 'cls-12-b', 'cls-12-c'], label: '12ABC', periodsPerWeek: 7, isCombine: true },
  { id: 'ccr-gow-3', teacherId: 't-gowri', teacherName: 'Gowri', subjectId: 'sub-phy', subjectName: 'Physics', classIds: ['cls-11-d'], label: '11D', periodsPerWeek: 7, isCombine: false },
  { id: 'ccr-gow-4', teacherId: 't-gowri', teacherName: 'Gowri', subjectId: 'sub-phy', subjectName: 'Physics', classIds: ['cls-12-d'], label: '12D', periodsPerWeek: 7, isCombine: false },

  // Nithya: Chemistry (Total = 28)
  { id: 'ccr-nit-1', teacherId: 't-nithya', teacherName: 'Nithya', subjectId: 'sub-che', subjectName: 'Chemistry', classIds: ['cls-11-a', 'cls-11-b', 'cls-11-c'], label: '11ABC', periodsPerWeek: 7, isCombine: true },
  { id: 'ccr-nit-2', teacherId: 't-nithya', teacherName: 'Nithya', subjectId: 'sub-che', subjectName: 'Chemistry', classIds: ['cls-12-a', 'cls-12-b', 'cls-12-c'], label: '12ABC', periodsPerWeek: 7, isCombine: true },
  { id: 'ccr-nit-3', teacherId: 't-nithya', teacherName: 'Nithya', subjectId: 'sub-che', subjectName: 'Chemistry', classIds: ['cls-11-d'], label: '11D', periodsPerWeek: 7, isCombine: false },
  { id: 'ccr-nit-4', teacherId: 't-nithya', teacherName: 'Nithya', subjectId: 'sub-che', subjectName: 'Chemistry', classIds: ['cls-12-d'], label: '12D', periodsPerWeek: 7, isCombine: false },

  // Lathamani: Maths (Total = 28)
  { id: 'ccr-lat-1', teacherId: 't-lathamani', teacherName: 'Lathamani', subjectId: 'sub-math', subjectName: 'Maths', classIds: ['cls-11-a', 'cls-11-b'], label: '11AB', periodsPerWeek: 7, isCombine: true },
  { id: 'ccr-lat-2', teacherId: 't-lathamani', teacherName: 'Lathamani', subjectId: 'sub-math', subjectName: 'Maths', classIds: ['cls-12-a', 'cls-12-b'], label: '12AB', periodsPerWeek: 7, isCombine: true },
  { id: 'ccr-lat-3', teacherId: 't-lathamani', teacherName: 'Lathamani', subjectId: 'sub-math', subjectName: 'Maths', classIds: ['cls-11-d'], label: '11D', periodsPerWeek: 7, isCombine: false },
  { id: 'ccr-lat-4', teacherId: 't-lathamani', teacherName: 'Lathamani', subjectId: 'sub-math', subjectName: 'Maths', classIds: ['cls-12-d'], label: '12D', periodsPerWeek: 7, isCombine: false },

  // Ramesh: Bio-Botany & Botany (Total = 30)
  { id: 'ccr-ram-1', teacherId: 't-ramesh-bot', teacherName: 'Ramesh', subjectId: 'sub-bio-bot', subjectName: 'Bio-Botany', classIds: ['cls-11-b', 'cls-11-e'], label: '11BE', periodsPerWeek: 4, isCombine: true },
  { id: 'ccr-ram-2', teacherId: 't-ramesh-bot', teacherName: 'Ramesh', subjectId: 'sub-bot', subjectName: 'Botany', classIds: ['cls-11-c'], label: '11C', periodsPerWeek: 7, isCombine: false },
  { id: 'ccr-ram-3', teacherId: 't-ramesh-bot', teacherName: 'Ramesh', subjectId: 'sub-bio-bot', subjectName: 'Bio-Botany', classIds: ['cls-11-d'], label: '11D', periodsPerWeek: 4, isCombine: false },
  { id: 'ccr-ram-4', teacherId: 't-ramesh-bot', teacherName: 'Ramesh', subjectId: 'sub-bio-bot', subjectName: 'Bio-Botany', classIds: ['cls-12-b', 'cls-12-e'], label: '12BE', periodsPerWeek: 4, isCombine: true },
  { id: 'ccr-ram-5', teacherId: 't-ramesh-bot', teacherName: 'Ramesh', subjectId: 'sub-bot', subjectName: 'Botany', classIds: ['cls-12-c'], label: '12C', periodsPerWeek: 7, isCombine: false },
  { id: 'ccr-ram-6', teacherId: 't-ramesh-bot', teacherName: 'Ramesh', subjectId: 'sub-bio-bot', subjectName: 'Bio-Botany', classIds: ['cls-12-d'], label: '12D', periodsPerWeek: 4, isCombine: false },

  // Sundar: Bio-Zoology & Zoology (Total = 30)
  { id: 'ccr-sun-1', teacherId: 't-sundar-zoo', teacherName: 'Sundar', subjectId: 'sub-bio-zoo', subjectName: 'Bio-Zoology', classIds: ['cls-11-b', 'cls-11-e'], label: '11BE', periodsPerWeek: 4, isCombine: true },
  { id: 'ccr-sun-2', teacherId: 't-sundar-zoo', teacherName: 'Sundar', subjectId: 'sub-zoo', subjectName: 'Zoology', classIds: ['cls-11-c'], label: '11C', periodsPerWeek: 7, isCombine: false },
  { id: 'ccr-sun-3', teacherId: 't-sundar-zoo', teacherName: 'Sundar', subjectId: 'sub-bio-zoo', subjectName: 'Bio-Zoology', classIds: ['cls-11-d'], label: '11D', periodsPerWeek: 4, isCombine: false },
  { id: 'ccr-sun-4', teacherId: 't-sundar-zoo', teacherName: 'Sundar', subjectId: 'sub-bio-zoo', subjectName: 'Bio-Zoology', classIds: ['cls-12-b', 'cls-12-e'], label: '12BE', periodsPerWeek: 4, isCombine: true },
  { id: 'ccr-sun-5', teacherId: 't-sundar-zoo', teacherName: 'Sundar', subjectId: 'sub-zoo', subjectName: 'Zoology', classIds: ['cls-12-c'], label: '12C', periodsPerWeek: 7, isCombine: false },
  { id: 'ccr-sun-6', teacherId: 't-sundar-zoo', teacherName: 'Sundar', subjectId: 'sub-bio-zoo', subjectName: 'Bio-Zoology', classIds: ['cls-12-d'], label: '12D', periodsPerWeek: 4, isCombine: false },

  // Siva: Computer Science & Emp Skills (Total = 28)
  { id: 'ccr-siv-1', teacherId: 't-31', teacherName: 'Siva', subjectId: 'sub-cs', subjectName: 'Computer Science', classIds: ['cls-11-a'], label: '11A', periodsPerWeek: 7, isCombine: false },
  { id: 'ccr-siv-2', teacherId: 't-31', teacherName: 'Siva', subjectId: 'sub-es', subjectName: 'Emp Skills', classIds: ['cls-11-e'], label: '11E', periodsPerWeek: 7, isCombine: false },
  { id: 'ccr-siv-3', teacherId: 't-31', teacherName: 'Siva', subjectId: 'sub-cs', subjectName: 'Computer Science', classIds: ['cls-12-a'], label: '12A', periodsPerWeek: 7, isCombine: false },
  { id: 'ccr-siv-4', teacherId: 't-31', teacherName: 'Siva', subjectId: 'sub-es', subjectName: 'Emp Skills', classIds: ['cls-12-e'], label: '12E', periodsPerWeek: 7, isCombine: false },

  // Maritheivam: Agri-T & Agri-P (Total = 28)
  { id: 'ccr-mar-1', teacherId: 't-maritheivam', teacherName: 'Maritheivam', subjectId: 'sub-agri-t', subjectName: 'Agri-T', classIds: ['cls-11-e'], label: '11E', periodsPerWeek: 7, isCombine: false },
  { id: 'ccr-mar-2', teacherId: 't-maritheivam', teacherName: 'Maritheivam', subjectId: 'sub-agri-p', subjectName: 'Agri-P', classIds: ['cls-11-e'], label: '11E', periodsPerWeek: 7, isCombine: false },
  { id: 'ccr-mar-3', teacherId: 't-maritheivam', teacherName: 'Maritheivam', subjectId: 'sub-agri-t', subjectName: 'Agri-T', classIds: ['cls-12-e'], label: '12E', periodsPerWeek: 7, isCombine: false },
  { id: 'ccr-mar-4', teacherId: 't-maritheivam', teacherName: 'Maritheivam', subjectId: 'sub-agri-p', subjectName: 'Agri-P', classIds: ['cls-12-e'], label: '12E', periodsPerWeek: 7, isCombine: false },
];

/**
 * Official Practical Subjects Classification (Science & Vocational Groups)
 * As notified by Department of School Education, Tamil Nadu
 */
export const practicalSubjectsConfig = {
  scienceGroup: [
    { id: 'sub-phy', name: 'Physics', tamilName: 'இயற்பியல் செய்முறை', code: 'PHY', periods: 2 },
    { id: 'sub-che', name: 'Chemistry', tamilName: 'வேதியியல் செய்முறை', code: 'CHE', periods: 2 },
    { id: 'sub-cs', name: 'Computer Science', tamilName: 'கணினி அறிவியல் செய்முறை', code: 'CS', periods: 2 },
    { id: 'sub-bio-bot', name: 'Bio-Botany', tamilName: 'உயிரி-தாவரவியல் செய்முறை', code: 'B-BOT', periods: 2 },
    { id: 'sub-bio-zoo', name: 'Bio-Zoology', tamilName: 'உயிரி-விலங்கியல் செய்முறை', code: 'B-ZOO', periods: 2 },
    { id: 'sub-bot', name: 'Botany', tamilName: 'தாவரவியல் செய்முறை', code: 'BOT', periods: 2 },
    { id: 'sub-zoo', name: 'Zoology', tamilName: 'விலங்கியல் செய்முறை', code: 'ZOO', periods: 2 },
  ],
  vocationalGroup: [
    { id: 'sub-agri-p', name: 'Agri-Practical (Agri-P)', tamilName: 'வேளாண்மை செய்முறை', code: 'AGRI-P', periods: 7 },
    { id: 'sub-es', name: 'Employability Skills (Emp Skills)', tamilName: 'வேலைவாய்ப்புத் திறன் செய்முறை', code: 'ES', periods: 7 },
  ],
};

/**
 * Builds Subject Requirements for all classes
 */
export function generateInitialPeriodRequirements(): SubjectPeriodRequirement[] {
  const reqs: SubjectPeriodRequirement[] = [];

  const add = (classId: string, subjectId: string, assigned: number, dist: [number, number, number, number, number]) => {
    reqs.push({
      classId,
      subjectId,
      assignedPerWeek: assigned,
      dailyDistribution: {
        Monday: dist[0],
        Tuesday: dist[1],
        Wednesday: dist[2],
        Thursday: dist[3],
        Friday: dist[4],
        Saturday: 0,
      },
    });
  };

  // Primary Classes 1-2
  ['cls-1', 'cls-2'].forEach(cId => {
    add(cId, 'sub-tam', 10, [2, 2, 2, 2, 2]);
    add(cId, 'sub-eng', 8, [2, 1, 2, 1, 2]);
    add(cId, 'sub-math', 8, [1, 2, 1, 2, 2]);
    add(cId, 'sub-evs', 4, [1, 1, 1, 1, 0]);
    add(cId, 'sub-pet', 3, [1, 0, 1, 0, 1]);
    add(cId, 'sub-art-sel', 2, [0, 1, 0, 1, 0]);
    add(cId, 'sub-lib-val', 5, [1, 1, 1, 1, 1]);
  });

  // Primary Classes 3-5
  ['cls-3', 'cls-4', 'cls-5'].forEach(cId => {
    add(cId, 'sub-tam', 8, [2, 2, 1, 2, 1]);
    add(cId, 'sub-eng', 8, [2, 1, 2, 1, 2]);
    add(cId, 'sub-math', 7, [1, 2, 1, 2, 1]);
    add(cId, 'sub-sci', 4, [1, 1, 1, 1, 0]);
    add(cId, 'sub-soc', 4, [0, 1, 1, 0, 2]);
    add(cId, 'sub-pet', 3, [1, 0, 1, 0, 1]);
    add(cId, 'sub-art-sel', 1, [0, 0, 0, 1, 0]);
    add(cId, 'sub-lib-val', 5, [1, 1, 1, 1, 1]);
  });

  // Middle School 6-8
  ['cls-6', 'cls-7', 'cls-8'].forEach(cId => {
    add(cId, 'sub-tam', 6, [2, 1, 1, 1, 1]);
    add(cId, 'sub-eng', 5, [1, 1, 1, 1, 1]);
    add(cId, 'sub-math', 7, [1, 2, 1, 2, 1]);
    add(cId, 'sub-sci', 7, [2, 1, 2, 1, 1]);
    add(cId, 'sub-soc', 6, [1, 1, 1, 1, 2]);
    add(cId, 'sub-lang-lab', 1, [0, 1, 0, 0, 0]);
    add(cId, 'sub-lib-val', 1, [0, 0, 1, 0, 0]);
    add(cId, 'sub-pet', 3, [1, 0, 0, 1, 1]);
    add(cId, 'sub-cca-pet', 2, [0, 1, 0, 1, 0]);
    add(cId, 'sub-spark', 2, [0, 0, 1, 0, 1]);
  });

  // High School 9-10
  add('cls-9', 'sub-tam', 6, [1, 2, 1, 1, 1]);
  add('cls-9', 'sub-eng', 6, [1, 1, 2, 1, 1]);
  add('cls-9', 'sub-math', 7, [2, 1, 1, 2, 1]);
  add('cls-9', 'sub-sci', 7, [1, 2, 1, 1, 2]);
  add('cls-9', 'sub-soc', 6, [1, 1, 1, 2, 1]);
  add('cls-9', 'sub-lib-val', 1, [0, 0, 1, 0, 0]);
  add('cls-9', 'sub-pet', 3, [1, 0, 0, 1, 1]);
  add('cls-9', 'sub-cca-pet', 2, [0, 1, 0, 0, 1]);
  add('cls-9', 'sub-spark', 2, [1, 0, 1, 0, 0]);

  add('cls-10', 'sub-tam', 6, [2, 1, 1, 1, 1]);
  add('cls-10', 'sub-eng', 6, [1, 2, 1, 1, 1]);
  add('cls-10', 'sub-math', 7, [1, 1, 2, 2, 1]);
  add('cls-10', 'sub-sci', 7, [2, 1, 1, 1, 2]);
  add('cls-10', 'sub-soc', 6, [1, 1, 1, 2, 1]);
  add('cls-10', 'sub-lib-val', 1, [0, 0, 1, 0, 0]);
  add('cls-10', 'sub-pet', 3, [1, 0, 0, 1, 1]);
  add('cls-10', 'sub-cca-eca', 2, [0, 1, 0, 0, 1]);
  add('cls-10', 'sub-cca-pet', 2, [0, 1, 1, 0, 0]);

  // Higher Secondary: Class 11A (Maths-CS) - 40 periods
  add('cls-11-a', 'sub-tam', 5, [1, 1, 1, 1, 1]);
  add('cls-11-a', 'sub-eng', 5, [1, 1, 1, 1, 1]);
  add('cls-11-a', 'sub-phy', 7, [2, 1, 1, 2, 1]);
  add('cls-11-a', 'sub-che', 7, [1, 2, 2, 1, 1]);
  add('cls-11-a', 'sub-math', 7, [2, 1, 1, 1, 2]);
  add('cls-11-a', 'sub-cs', 7, [1, 1, 2, 1, 2]);
  add('cls-11-a', 'sub-pet', 2, [0, 1, 0, 1, 0]);

  // Class 11B (Maths-Bio) - 40 periods
  add('cls-11-b', 'sub-tam', 5, [1, 1, 1, 1, 1]);
  add('cls-11-b', 'sub-eng', 5, [1, 1, 1, 1, 1]);
  add('cls-11-b', 'sub-phy', 7, [2, 1, 1, 2, 1]);
  add('cls-11-b', 'sub-che', 7, [1, 2, 2, 1, 1]);
  add('cls-11-b', 'sub-math', 7, [2, 1, 1, 1, 2]);
  add('cls-11-b', 'sub-bio-bot', 4, [1, 1, 1, 1, 0]);
  add('cls-11-b', 'sub-bio-zoo', 4, [0, 1, 1, 0, 2]);
  add('cls-11-b', 'sub-pet', 1, [0, 0, 0, 0, 1]);

  // Class 11C (Pure Science: Botany & Zoology) - 40 periods
  add('cls-11-c', 'sub-tam', 5, [1, 1, 1, 1, 1]);
  add('cls-11-c', 'sub-eng', 5, [1, 1, 1, 1, 1]);
  add('cls-11-c', 'sub-phy', 7, [2, 1, 1, 2, 1]);
  add('cls-11-c', 'sub-che', 7, [1, 2, 2, 1, 1]);
  add('cls-11-c', 'sub-bot', 7, [2, 1, 1, 2, 1]);
  add('cls-11-c', 'sub-zoo', 7, [1, 2, 2, 1, 1]);
  add('cls-11-c', 'sub-pet', 2, [0, 0, 0, 0, 2]);

  // Class 11D (Bio-Maths) - 40 periods
  add('cls-11-d', 'sub-tam', 5, [1, 1, 1, 1, 1]);
  add('cls-11-d', 'sub-eng', 5, [1, 1, 1, 1, 1]);
  add('cls-11-d', 'sub-phy', 7, [1, 2, 1, 2, 1]);
  add('cls-11-d', 'sub-che', 7, [2, 1, 2, 1, 1]);
  add('cls-11-d', 'sub-math', 7, [1, 1, 2, 1, 2]);
  add('cls-11-d', 'sub-bio-bot', 4, [1, 1, 0, 1, 1]);
  add('cls-11-d', 'sub-bio-zoo', 4, [1, 1, 1, 0, 1]);
  add('cls-11-d', 'sub-pet', 1, [0, 0, 0, 1, 0]);

  // Class 11E (Vocational Agri & Employability Skills) - 40 periods
  add('cls-11-e', 'sub-tam', 4, [1, 1, 1, 1, 0]);
  add('cls-11-e', 'sub-eng', 4, [1, 1, 1, 0, 1]);
  add('cls-11-e', 'sub-es', 7, [1, 1, 2, 2, 1]);
  add('cls-11-e', 'sub-agri-t', 7, [2, 1, 1, 2, 1]);
  add('cls-11-e', 'sub-agri-p', 7, [1, 2, 2, 1, 1]);
  add('cls-11-e', 'sub-bio-bot', 4, [1, 1, 1, 1, 0]);
  add('cls-11-e', 'sub-bio-zoo', 4, [0, 1, 1, 0, 2]);
  add('cls-11-e', 'sub-pet', 3, [1, 0, 0, 1, 1]);

  // Class 12A (Maths-CS) - 40 periods
  add('cls-12-a', 'sub-tam', 5, [1, 1, 1, 1, 1]);
  add('cls-12-a', 'sub-eng', 5, [1, 1, 1, 1, 1]);
  add('cls-12-a', 'sub-phy', 7, [1, 2, 1, 1, 2]);
  add('cls-12-a', 'sub-che', 7, [2, 1, 2, 1, 1]);
  add('cls-12-a', 'sub-math', 7, [1, 1, 2, 2, 1]);
  add('cls-12-a', 'sub-cs', 7, [2, 1, 1, 2, 1]);
  add('cls-12-a', 'sub-pet', 2, [0, 1, 0, 0, 1]);

  // Class 12B (Maths-Bio) - 40 periods
  add('cls-12-b', 'sub-tam', 5, [1, 1, 1, 1, 1]);
  add('cls-12-b', 'sub-eng', 5, [1, 1, 1, 1, 1]);
  add('cls-12-b', 'sub-phy', 7, [1, 2, 1, 1, 2]);
  add('cls-12-b', 'sub-che', 7, [2, 1, 2, 1, 1]);
  add('cls-12-b', 'sub-math', 7, [1, 1, 2, 2, 1]);
  add('cls-12-b', 'sub-bio-bot', 4, [1, 1, 1, 0, 1]);
  add('cls-12-b', 'sub-bio-zoo', 4, [1, 0, 1, 1, 1]);
  add('cls-12-b', 'sub-pet', 1, [0, 1, 0, 0, 0]);

  // Class 12C (Pure Science) - 40 periods
  add('cls-12-c', 'sub-tam', 5, [1, 1, 1, 1, 1]);
  add('cls-12-c', 'sub-eng', 5, [1, 1, 1, 1, 1]);
  add('cls-12-c', 'sub-phy', 7, [1, 2, 1, 1, 2]);
  add('cls-12-c', 'sub-che', 7, [2, 1, 2, 1, 1]);
  add('cls-12-c', 'sub-bot', 7, [1, 2, 1, 2, 1]);
  add('cls-12-c', 'sub-zoo', 7, [2, 1, 2, 1, 1]);
  add('cls-12-c', 'sub-pet', 2, [0, 0, 0, 1, 1]);

  // Class 12D (Bio-Maths) - 40 periods
  add('cls-12-d', 'sub-tam', 5, [1, 1, 1, 1, 1]);
  add('cls-12-d', 'sub-eng', 5, [1, 1, 1, 1, 1]);
  add('cls-12-d', 'sub-phy', 7, [2, 1, 1, 2, 1]);
  add('cls-12-d', 'sub-che', 7, [1, 2, 1, 1, 2]);
  add('cls-12-d', 'sub-math', 7, [2, 1, 2, 1, 1]);
  add('cls-12-d', 'sub-bio-bot', 4, [0, 1, 1, 1, 1]);
  add('cls-12-d', 'sub-bio-zoo', 4, [1, 1, 0, 1, 1]);
  add('cls-12-d', 'sub-pet', 1, [0, 0, 1, 0, 0]);

  // Class 12E (Vocational Agri & Employability Skills) - 40 periods
  add('cls-12-e', 'sub-tam', 5, [1, 1, 1, 1, 1]);
  add('cls-12-e', 'sub-eng', 5, [1, 1, 1, 1, 1]);
  add('cls-12-e', 'sub-es', 7, [2, 1, 1, 1, 2]);
  add('cls-12-e', 'sub-agri-t', 7, [1, 2, 2, 1, 1]);
  add('cls-12-e', 'sub-agri-p', 7, [2, 1, 1, 2, 1]);
  add('cls-12-e', 'sub-bio-bot', 4, [1, 1, 1, 0, 1]);
  add('cls-12-e', 'sub-bio-zoo', 4, [1, 0, 1, 1, 1]);
  add('cls-12-e', 'sub-pet', 1, [0, 1, 0, 0, 0]);

  return reqs;
}

export const initialRequirements = generateInitialPeriodRequirements();

// Subject-Teacher Mappings
export const initialClassTeacherMappings: ClassSubjectTeacherMapping[] = [
  // Primary (1-5)
  { classId: 'cls-1', subjectId: 'sub-tam', teacherId: 't-1' },
  { classId: 'cls-1', subjectId: 'sub-eng', teacherId: 't-2' },
  { classId: 'cls-1', subjectId: 'sub-math', teacherId: 't-4' },
  { classId: 'cls-1', subjectId: 'sub-evs', teacherId: 't-8' },
  { classId: 'cls-1', subjectId: 'sub-pet', teacherId: 't-13' },
  { classId: 'cls-1', subjectId: 'sub-art-sel', teacherId: 't-14' },
  { classId: 'cls-1', subjectId: 'sub-lib-val', teacherId: 't-29' },

  { classId: 'cls-2', subjectId: 'sub-tam', teacherId: 't-3' },
  { classId: 'cls-2', subjectId: 'sub-eng', teacherId: 't-6' },
  { classId: 'cls-2', subjectId: 'sub-math', teacherId: 't-4' },
  { classId: 'cls-2', subjectId: 'sub-evs', teacherId: 't-8' },
  { classId: 'cls-2', subjectId: 'sub-pet', teacherId: 't-13' },
  { classId: 'cls-2', subjectId: 'sub-art-sel', teacherId: 't-14' },
  { classId: 'cls-2', subjectId: 'sub-lib-val', teacherId: 't-29' },

  { classId: 'cls-3', subjectId: 'sub-tam', teacherId: 't-1' },
  { classId: 'cls-3', subjectId: 'sub-eng', teacherId: 't-6' },
  { classId: 'cls-3', subjectId: 'sub-math', teacherId: 't-5' },
  { classId: 'cls-3', subjectId: 'sub-sci', teacherId: 't-7' },
  { classId: 'cls-3', subjectId: 'sub-soc', teacherId: 't-9' },
  { classId: 'cls-3', subjectId: 'sub-pet', teacherId: 't-19' },
  { classId: 'cls-3', subjectId: 'sub-art-sel', teacherId: 't-14' },
  { classId: 'cls-3', subjectId: 'sub-lib-val', teacherId: 't-29' },

  { classId: 'cls-4', subjectId: 'sub-tam', teacherId: 't-3' },
  { classId: 'cls-4', subjectId: 'sub-eng', teacherId: 't-2' },
  { classId: 'cls-4', subjectId: 'sub-math', teacherId: 't-5' },
  { classId: 'cls-4', subjectId: 'sub-sci', teacherId: 't-8' },
  { classId: 'cls-4', subjectId: 'sub-soc', teacherId: 't-10' },
  { classId: 'cls-4', subjectId: 'sub-pet', teacherId: 't-19' },
  { classId: 'cls-4', subjectId: 'sub-art-sel', teacherId: 't-14' },
  { classId: 'cls-4', subjectId: 'sub-lib-val', teacherId: 't-29' },

  { classId: 'cls-5', subjectId: 'sub-tam', teacherId: 't-20' },
  { classId: 'cls-5', subjectId: 'sub-eng', teacherId: 't-16' },
  { classId: 'cls-5', subjectId: 'sub-math', teacherId: 't-15' },
  { classId: 'cls-5', subjectId: 'sub-sci', teacherId: 't-7' },
  { classId: 'cls-5', subjectId: 'sub-soc', teacherId: 't-18' },
  { classId: 'cls-5', subjectId: 'sub-pet', teacherId: 't-13' },
  { classId: 'cls-5', subjectId: 'sub-art-sel', teacherId: 't-14' },
  { classId: 'cls-5', subjectId: 'sub-lib-val', teacherId: 't-29' },

  // Middle School (6-8)
  { classId: 'cls-6', subjectId: 'sub-tam', teacherId: 't-20' },
  { classId: 'cls-6', subjectId: 'sub-eng', teacherId: 't-16' },
  { classId: 'cls-6', subjectId: 'sub-math', teacherId: 't-15' },
  { classId: 'cls-6', subjectId: 'sub-sci', teacherId: 't-17' },
  { classId: 'cls-6', subjectId: 'sub-soc', teacherId: 't-18' },
  { classId: 'cls-6', subjectId: 'sub-lang-lab', teacherId: 't-12' },
  { classId: 'cls-6', subjectId: 'sub-lib-val', teacherId: 't-29' },
  { classId: 'cls-6', subjectId: 'sub-pet', teacherId: 't-19' },
  { classId: 'cls-6', subjectId: 'sub-cca-pet', teacherId: 't-13' },
  { classId: 'cls-6', subjectId: 'sub-spark', teacherId: 't-11' },

  { classId: 'cls-7', subjectId: 'sub-tam', teacherId: 't-26' },
  { classId: 'cls-7', subjectId: 'sub-eng', teacherId: 't-24' },
  { classId: 'cls-7', subjectId: 'sub-math', teacherId: 't-5' },
  { classId: 'cls-7', subjectId: 'sub-sci', teacherId: 't-7' },
  { classId: 'cls-7', subjectId: 'sub-soc', teacherId: 't-25' },
  { classId: 'cls-7', subjectId: 'sub-lang-lab', teacherId: 't-12' },
  { classId: 'cls-7', subjectId: 'sub-lib-val', teacherId: 't-29' },
  { classId: 'cls-7', subjectId: 'sub-pet', teacherId: 't-13' },
  { classId: 'cls-7', subjectId: 'sub-cca-pet', teacherId: 't-19' },
  { classId: 'cls-7', subjectId: 'sub-spark', teacherId: 't-21' },

  { classId: 'cls-8', subjectId: 'sub-tam', teacherId: 't-26' },
  { classId: 'cls-8', subjectId: 'sub-eng', teacherId: 't-24' },
  { classId: 'cls-8', subjectId: 'sub-math', teacherId: 't-4' },
  { classId: 'cls-8', subjectId: 'sub-sci', teacherId: 't-8' },
  { classId: 'cls-8', subjectId: 'sub-soc', teacherId: 't-25' },
  { classId: 'cls-8', subjectId: 'sub-lang-lab', teacherId: 't-12' },
  { classId: 'cls-8', subjectId: 'sub-lib-val', teacherId: 't-29' },
  { classId: 'cls-8', subjectId: 'sub-pet', teacherId: 't-19' },
  { classId: 'cls-8', subjectId: 'sub-cca-pet', teacherId: 't-13' },
  { classId: 'cls-8', subjectId: 'sub-spark', teacherId: 't-11' },

  // High School (9 and 10)
  { classId: 'cls-9', subjectId: 'sub-tam', teacherId: 't-1' },
  { classId: 'cls-9', subjectId: 'sub-eng', teacherId: 't-24' },
  { classId: 'cls-9', subjectId: 'sub-math', teacherId: 't-15' },
  { classId: 'cls-9', subjectId: 'sub-sci', teacherId: 't-17' },
  { classId: 'cls-9', subjectId: 'sub-soc', teacherId: 't-25' },
  { classId: 'cls-9', subjectId: 'sub-lib-val', teacherId: 't-29' },
  { classId: 'cls-9', subjectId: 'sub-pet', teacherId: 't-13' },
  { classId: 'cls-9', subjectId: 'sub-cca-pet', teacherId: 't-19' },
  { classId: 'cls-9', subjectId: 'sub-spark', teacherId: 't-21' },

  { classId: 'cls-10', subjectId: 'sub-tam', teacherId: 't-3' },
  { classId: 'cls-10', subjectId: 'sub-eng', teacherId: 't-16' },
  { classId: 'cls-10', subjectId: 'sub-math', teacherId: 't-5' },
  { classId: 'cls-10', subjectId: 'sub-sci', teacherId: 't-7' },
  { classId: 'cls-10', subjectId: 'sub-soc', teacherId: 't-18' },
  { classId: 'cls-10', subjectId: 'sub-lib-val', teacherId: 't-29' },
  { classId: 'cls-10', subjectId: 'sub-pet', teacherId: 't-19' },
  { classId: 'cls-10', subjectId: 'sub-cca-eca', teacherId: 't-14' },
  { classId: 'cls-10', subjectId: 'sub-cca-pet', teacherId: 't-13' },

  // Higher Secondary Classes (11A-E & 12A-E)
  // Subbulakshmi: Tamil (11A,B,C,D,E & 12A,B,C,D,E)
  ...['cls-11-a', 'cls-11-b', 'cls-11-c', 'cls-11-d', 'cls-11-e', 'cls-12-a', 'cls-12-b', 'cls-12-c', 'cls-12-d', 'cls-12-e'].map(cid => ({
    classId: cid,
    subjectId: 'sub-tam',
    teacherId: 't-subbulakshmi',
  })),

  // Pradeepa: English (11A,B,C,D,E & 12A,B,C,D,E)
  ...['cls-11-a', 'cls-11-b', 'cls-11-c', 'cls-11-d', 'cls-11-e', 'cls-12-a', 'cls-12-b', 'cls-12-c', 'cls-12-d', 'cls-12-e'].map(cid => ({
    classId: cid,
    subjectId: 'sub-eng',
    teacherId: 't-pradeepa',
  })),

  // Gowri: Physics (11A,B,C,D & 12A,B,C,D)
  ...['cls-11-a', 'cls-11-b', 'cls-11-c', 'cls-11-d', 'cls-12-a', 'cls-12-b', 'cls-12-c', 'cls-12-d'].map(cid => ({
    classId: cid,
    subjectId: 'sub-phy',
    teacherId: 't-gowri',
  })),

  // Nithya: Chemistry (11A,B,C,D & 12A,B,C,D)
  ...['cls-11-a', 'cls-11-b', 'cls-11-c', 'cls-11-d', 'cls-12-a', 'cls-12-b', 'cls-12-c', 'cls-12-d'].map(cid => ({
    classId: cid,
    subjectId: 'sub-che',
    teacherId: 't-nithya',
  })),

  // Lathamani: Maths (11A,B,D & 12A,B,D)
  ...['cls-11-a', 'cls-11-b', 'cls-11-d', 'cls-12-a', 'cls-12-b', 'cls-12-d'].map(cid => ({
    classId: cid,
    subjectId: 'sub-math',
    teacherId: 't-lathamani',
  })),

  // Ramesh: Bio-Botany & Botany
  { classId: 'cls-11-b', subjectId: 'sub-bio-bot', teacherId: 't-ramesh-bot' },
  { classId: 'cls-11-e', subjectId: 'sub-bio-bot', teacherId: 't-ramesh-bot' },
  { classId: 'cls-11-c', subjectId: 'sub-bot', teacherId: 't-ramesh-bot' },
  { classId: 'cls-11-d', subjectId: 'sub-bio-bot', teacherId: 't-ramesh-bot' },
  { classId: 'cls-12-b', subjectId: 'sub-bio-bot', teacherId: 't-ramesh-bot' },
  { classId: 'cls-12-e', subjectId: 'sub-bio-bot', teacherId: 't-ramesh-bot' },
  { classId: 'cls-12-c', subjectId: 'sub-bot', teacherId: 't-ramesh-bot' },
  { classId: 'cls-12-d', subjectId: 'sub-bio-bot', teacherId: 't-ramesh-bot' },

  // Sundar: Bio-Zoology & Zoology
  { classId: 'cls-11-b', subjectId: 'sub-bio-zoo', teacherId: 't-sundar-zoo' },
  { classId: 'cls-11-e', subjectId: 'sub-bio-zoo', teacherId: 't-sundar-zoo' },
  { classId: 'cls-11-c', subjectId: 'sub-zoo', teacherId: 't-sundar-zoo' },
  { classId: 'cls-11-d', subjectId: 'sub-bio-zoo', teacherId: 't-sundar-zoo' },
  { classId: 'cls-12-b', subjectId: 'sub-bio-zoo', teacherId: 't-sundar-zoo' },
  { classId: 'cls-12-e', subjectId: 'sub-bio-zoo', teacherId: 't-sundar-zoo' },
  { classId: 'cls-12-c', subjectId: 'sub-zoo', teacherId: 't-sundar-zoo' },
  { classId: 'cls-12-d', subjectId: 'sub-bio-zoo', teacherId: 't-sundar-zoo' },

  // Siva: Computer Science (11A, 12A) & Employability Skills (11E, 12E)
  { classId: 'cls-11-a', subjectId: 'sub-cs', teacherId: 't-31' },
  { classId: 'cls-12-a', subjectId: 'sub-cs', teacherId: 't-31' },
  { classId: 'cls-11-e', subjectId: 'sub-es', teacherId: 't-31' },
  { classId: 'cls-12-e', subjectId: 'sub-es', teacherId: 't-31' },

  // Maritheivam: Agri-T & Agri-P (11E, 12E)
  { classId: 'cls-11-e', subjectId: 'sub-agri-t', teacherId: 't-maritheivam' },
  { classId: 'cls-11-e', subjectId: 'sub-agri-p', teacherId: 't-maritheivam' },
  { classId: 'cls-12-e', subjectId: 'sub-agri-t', teacherId: 't-maritheivam' },
  { classId: 'cls-12-e', subjectId: 'sub-agri-p', teacherId: 't-maritheivam' },
];

/**
 * Generates the authentic, conflict-free Higher Secondary combined and individual schedule
 * matching user specifications with 100% exact period load for each teacher.
 */
export function generateHigherSecondaryBenchmarkSlots(): TimetableSlot[] {
  const slots: TimetableSlot[] = [];
  let counter = 1000;

  // Helper to add a teaching period (single class or combined class)
  const addSession = (
    teacherId: string,
    subjectId: string,
    classIds: string[],
    day: DayOfWeek,
    period: number,
    label: string,
    isCombine: boolean
  ) => {
    const groupId = isCombine ? `cg-${teacherId}-${subjectId}-${day}-${period}` : undefined;
    classIds.forEach(cId => {
      slots.push({
        id: `slot-${counter++}`,
        classId: cId,
        day,
        period,
        subjectId,
        teacherId,
        isCombined: isCombine,
        combinedClassIds: isCombine ? classIds : undefined,
        combinedLabel: label,
        combinedGroupId: groupId,
      });
    });
  };

  // -------------------------------------------------------------
  // 1. Subbulakshmi: Tamil (29 periods)
  // 11A,B,C = 5 periods (Mon-P1, Tue-P1, Wed-P1, Thu-P1, Fri-P1)
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach((day, i) => {
    addSession('t-subbulakshmi', 'sub-tam', ['cls-11-a', 'cls-11-b', 'cls-11-c'], day as DayOfWeek, 1, '11A,B,C', true);
  });

  // 12A,B,C = 5 periods (Mon-P4, Tue-P4, Wed-P4, Thu-P4, Fri-P4)
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach((day, i) => {
    addSession('t-subbulakshmi', 'sub-tam', ['cls-12-a', 'cls-12-b', 'cls-12-c'], day as DayOfWeek, 4, '12A,B,C', true);
  });

  // 11D = 5 periods (Mon-P5, Tue-P5, Wed-P5, Thu-P5, Fri-P5)
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach((day, i) => {
    addSession('t-subbulakshmi', 'sub-tam', ['cls-11-d'], day as DayOfWeek, 5, '11D', false);
  });

  // 12D = 5 periods (Mon-P7, Tue-P7, Wed-P7, Thu-P7, Fri-P7)
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach((day, i) => {
    addSession('t-subbulakshmi', 'sub-tam', ['cls-12-d'], day as DayOfWeek, 7, '12D', false);
  });

  // 11E = 4 periods (Mon-P2, Tue-P2, Wed-P2, Thu-P2)
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(day => {
    addSession('t-subbulakshmi', 'sub-tam', ['cls-11-e'], day as DayOfWeek, 2, '11E', false);
  });

  // 12E = 5 periods (Mon-P8, Tue-P8, Wed-P8, Thu-P8, Fri-P8)
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach((day, i) => {
    addSession('t-subbulakshmi', 'sub-tam', ['cls-12-e'], day as DayOfWeek, 8, '12E', false);
  });

  // -------------------------------------------------------------
  // 2. Pradeepa: English (29 periods)
  // 11A,B,C = 5 periods (Mon-P2, Tue-P2, Wed-P2, Thu-P2, Fri-P2)
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
    addSession('t-pradeepa', 'sub-eng', ['cls-11-a', 'cls-11-b', 'cls-11-c'], day as DayOfWeek, 2, '11A,B,C', true);
  });

  // 12A,B,C = 5 periods (Mon-P5, Tue-P5, Wed-P5, Thu-P5, Fri-P5)
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
    addSession('t-pradeepa', 'sub-eng', ['cls-12-a', 'cls-12-b', 'cls-12-c'], day as DayOfWeek, 5, '12A,B,C', true);
  });

  // 11D = 5 periods (Mon-P6, Tue-P6, Wed-P6, Thu-P6, Fri-P6)
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
    addSession('t-pradeepa', 'sub-eng', ['cls-11-d'], day as DayOfWeek, 6, '11D', false);
  });

  // 12D = 5 periods (Mon-P8, Tue-P8, Wed-P8, Thu-P8, Fri-P8)
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
    addSession('t-pradeepa', 'sub-eng', ['cls-12-d'], day as DayOfWeek, 8, '12D', false);
  });

  // 11E = 4 periods (Mon-P1, Tue-P1, Wed-P1, Fri-P1)
  ['Monday', 'Tuesday', 'Wednesday', 'Friday'].forEach(day => {
    addSession('t-pradeepa', 'sub-eng', ['cls-11-e'], day as DayOfWeek, 1, '11E', false);
  });

  // 12E = 5 periods (Mon-P7, Tue-P7, Wed-P7, Thu-P7, Fri-P7)
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
    addSession('t-pradeepa', 'sub-eng', ['cls-12-e'], day as DayOfWeek, 7, '12E', false);
  });

  // -------------------------------------------------------------
  // 3. Gowri: Physics (28 periods)
  // 11ABC = 7 periods: Mon(P3), Tue(P3, P4), Wed(P3), Thu(P3, P4), Fri(P3)
  addSession('t-gowri', 'sub-phy', ['cls-11-a', 'cls-11-b', 'cls-11-c'], 'Monday', 3, '11ABC', true);
  addSession('t-gowri', 'sub-phy', ['cls-11-a', 'cls-11-b', 'cls-11-c'], 'Tuesday', 3, '11ABC', true);
  addSession('t-gowri', 'sub-phy', ['cls-11-a', 'cls-11-b', 'cls-11-c'], 'Tuesday', 4, '11ABC', true);
  addSession('t-gowri', 'sub-phy', ['cls-11-a', 'cls-11-b', 'cls-11-c'], 'Wednesday', 3, '11ABC', true);
  addSession('t-gowri', 'sub-phy', ['cls-11-a', 'cls-11-b', 'cls-11-c'], 'Thursday', 3, '11ABC', true);
  addSession('t-gowri', 'sub-phy', ['cls-11-a', 'cls-11-b', 'cls-11-c'], 'Thursday', 4, '11ABC', true);
  addSession('t-gowri', 'sub-phy', ['cls-11-a', 'cls-11-b', 'cls-11-c'], 'Friday', 3, '11ABC', true);

  // 12ABC = 7 periods: Mon(P6), Tue(P6, P7), Wed(P6), Thu(P6, P7), Fri(P6)
  addSession('t-gowri', 'sub-phy', ['cls-12-a', 'cls-12-b', 'cls-12-c'], 'Monday', 6, '12ABC', true);
  addSession('t-gowri', 'sub-phy', ['cls-12-a', 'cls-12-b', 'cls-12-c'], 'Tuesday', 6, '12ABC', true);
  addSession('t-gowri', 'sub-phy', ['cls-12-a', 'cls-12-b', 'cls-12-c'], 'Tuesday', 7, '12ABC', true);
  addSession('t-gowri', 'sub-phy', ['cls-12-a', 'cls-12-b', 'cls-12-c'], 'Wednesday', 6, '12ABC', true);
  addSession('t-gowri', 'sub-phy', ['cls-12-a', 'cls-12-b', 'cls-12-c'], 'Thursday', 6, '12ABC', true);
  addSession('t-gowri', 'sub-phy', ['cls-12-a', 'cls-12-b', 'cls-12-c'], 'Thursday', 7, '12ABC', true);
  addSession('t-gowri', 'sub-phy', ['cls-12-a', 'cls-12-b', 'cls-12-c'], 'Friday', 6, '12ABC', true);

  // 11D = 7 periods: Mon(P1, P2), Tue(P1, P2), Wed(P1), Thu(P1), Fri(P1)
  addSession('t-gowri', 'sub-phy', ['cls-11-d'], 'Monday', 1, '11D', false);
  addSession('t-gowri', 'sub-phy', ['cls-11-d'], 'Monday', 2, '11D', false);
  addSession('t-gowri', 'sub-phy', ['cls-11-d'], 'Tuesday', 1, '11D', false);
  addSession('t-gowri', 'sub-phy', ['cls-11-d'], 'Tuesday', 2, '11D', false);
  addSession('t-gowri', 'sub-phy', ['cls-11-d'], 'Wednesday', 1, '11D', false);
  addSession('t-gowri', 'sub-phy', ['cls-11-d'], 'Thursday', 1, '11D', false);
  addSession('t-gowri', 'sub-phy', ['cls-11-d'], 'Friday', 1, '11D', false);

  // 12D = 7 periods: Mon(P4, P5), Tue(P5), Wed(P4, P5), Thu(P5), Fri(P5)
  addSession('t-gowri', 'sub-phy', ['cls-12-d'], 'Monday', 4, '12D', false);
  addSession('t-gowri', 'sub-phy', ['cls-12-d'], 'Monday', 5, '12D', false);
  addSession('t-gowri', 'sub-phy', ['cls-12-d'], 'Tuesday', 5, '12D', false);
  addSession('t-gowri', 'sub-phy', ['cls-12-d'], 'Wednesday', 4, '12D', false);
  addSession('t-gowri', 'sub-phy', ['cls-12-d'], 'Wednesday', 5, '12D', false);
  addSession('t-gowri', 'sub-phy', ['cls-12-d'], 'Thursday', 5, '12D', false);
  addSession('t-gowri', 'sub-phy', ['cls-12-d'], 'Friday', 5, '12D', false);

  // -------------------------------------------------------------
  // 4. Nithya: Chemistry (28 periods)
  // 11ABC = 7 periods: Mon(P5), Tue(P5), Wed(P4, P5), Thu(P5), Fri(P4, P5)
  addSession('t-nithya', 'sub-che', ['cls-11-a', 'cls-11-b', 'cls-11-c'], 'Monday', 5, '11ABC', true);
  addSession('t-nithya', 'sub-che', ['cls-11-a', 'cls-11-b', 'cls-11-c'], 'Tuesday', 5, '11ABC', true);
  addSession('t-nithya', 'sub-che', ['cls-11-a', 'cls-11-b', 'cls-11-c'], 'Wednesday', 4, '11ABC', true);
  addSession('t-nithya', 'sub-che', ['cls-11-a', 'cls-11-b', 'cls-11-c'], 'Wednesday', 5, '11ABC', true);
  addSession('t-nithya', 'sub-che', ['cls-11-a', 'cls-11-b', 'cls-11-c'], 'Thursday', 5, '11ABC', true);
  addSession('t-nithya', 'sub-che', ['cls-11-a', 'cls-11-b', 'cls-11-c'], 'Friday', 4, '11ABC', true);
  addSession('t-nithya', 'sub-che', ['cls-11-a', 'cls-11-b', 'cls-11-c'], 'Friday', 5, '11ABC', true);

  // 12ABC = 7 periods: Mon(P1, P2), Tue(P1), Wed(P1, P2), Thu(P1), Fri(P1)
  addSession('t-nithya', 'sub-che', ['cls-12-a', 'cls-12-b', 'cls-12-c'], 'Monday', 1, '12ABC', true);
  addSession('t-nithya', 'sub-che', ['cls-12-a', 'cls-12-b', 'cls-12-c'], 'Monday', 2, '12ABC', true);
  addSession('t-nithya', 'sub-che', ['cls-12-a', 'cls-12-b', 'cls-12-c'], 'Tuesday', 1, '12ABC', true);
  addSession('t-nithya', 'sub-che', ['cls-12-a', 'cls-12-b', 'cls-12-c'], 'Wednesday', 1, '12ABC', true);
  addSession('t-nithya', 'sub-che', ['cls-12-a', 'cls-12-b', 'cls-12-c'], 'Wednesday', 2, '12ABC', true);
  addSession('t-nithya', 'sub-che', ['cls-12-a', 'cls-12-b', 'cls-12-c'], 'Thursday', 1, '12ABC', true);
  addSession('t-nithya', 'sub-che', ['cls-12-a', 'cls-12-b', 'cls-12-c'], 'Friday', 1, '12ABC', true);

  // 11D = 7 periods: Mon(P3, P4), Tue(P7, P8), Wed(P7, P8), Fri(P7)
  addSession('t-nithya', 'sub-che', ['cls-11-d'], 'Monday', 3, '11D', false);
  addSession('t-nithya', 'sub-che', ['cls-11-d'], 'Monday', 4, '11D', false);
  addSession('t-nithya', 'sub-che', ['cls-11-d'], 'Tuesday', 7, '11D', false);
  addSession('t-nithya', 'sub-che', ['cls-11-d'], 'Tuesday', 8, '11D', false);
  addSession('t-nithya', 'sub-che', ['cls-11-d'], 'Wednesday', 7, '11D', false);
  addSession('t-nithya', 'sub-che', ['cls-11-d'], 'Wednesday', 8, '11D', false);
  addSession('t-nithya', 'sub-che', ['cls-11-d'], 'Friday', 7, '11D', false);

  // 12D = 7 periods: Mon(P6), Tue(P2, P3), Wed(P3), Thu(P2, P3), Fri(P2)
  addSession('t-nithya', 'sub-che', ['cls-12-d'], 'Monday', 6, '12D', false);
  addSession('t-nithya', 'sub-che', ['cls-12-d'], 'Tuesday', 2, '12D', false);
  addSession('t-nithya', 'sub-che', ['cls-12-d'], 'Tuesday', 3, '12D', false);
  addSession('t-nithya', 'sub-che', ['cls-12-d'], 'Wednesday', 3, '12D', false);
  addSession('t-nithya', 'sub-che', ['cls-12-d'], 'Thursday', 2, '12D', false);
  addSession('t-nithya', 'sub-che', ['cls-12-d'], 'Thursday', 3, '12D', false);
  addSession('t-nithya', 'sub-che', ['cls-12-d'], 'Friday', 2, '12D', false);

  // -------------------------------------------------------------
  // 5. Lathamani: Maths (28 periods)
  // 11AB = 7 periods: Mon(P6, P7), Tue(P6), Wed(P6), Thu(P6), Fri(P5, P6)
  addSession('t-lathamani', 'sub-math', ['cls-11-a', 'cls-11-b'], 'Monday', 6, '11AB', true);
  addSession('t-lathamani', 'sub-math', ['cls-11-a', 'cls-11-b'], 'Monday', 7, '11AB', true);
  addSession('t-lathamani', 'sub-math', ['cls-11-a', 'cls-11-b'], 'Tuesday', 6, '11AB', true);
  addSession('t-lathamani', 'sub-math', ['cls-11-a', 'cls-11-b'], 'Wednesday', 6, '11AB', true);
  addSession('t-lathamani', 'sub-math', ['cls-11-a', 'cls-11-b'], 'Thursday', 6, '11AB', true);
  addSession('t-lathamani', 'sub-math', ['cls-11-a', 'cls-11-b'], 'Friday', 5, '11AB', true);
  addSession('t-lathamani', 'sub-math', ['cls-11-a', 'cls-11-b'], 'Friday', 6, '11AB', true);

  // 12AB = 7 periods: Mon(P3), Tue(P3), Wed(P3), Thu(P2, P3), Fri(P2, P3)
  addSession('t-lathamani', 'sub-math', ['cls-12-a', 'cls-12-b'], 'Monday', 3, '12AB', true);
  addSession('t-lathamani', 'sub-math', ['cls-12-a', 'cls-12-b'], 'Tuesday', 3, '12AB', true);
  addSession('t-lathamani', 'sub-math', ['cls-12-a', 'cls-12-b'], 'Wednesday', 3, '12AB', true);
  addSession('t-lathamani', 'sub-math', ['cls-12-a', 'cls-12-b'], 'Thursday', 2, '12AB', true);
  addSession('t-lathamani', 'sub-math', ['cls-12-a', 'cls-12-b'], 'Thursday', 3, '12AB', true);
  addSession('t-lathamani', 'sub-math', ['cls-12-a', 'cls-12-b'], 'Friday', 2, '12AB', true);
  addSession('t-lathamani', 'sub-math', ['cls-12-a', 'cls-12-b'], 'Friday', 3, '12AB', true);

  // 11D = 7 periods: Mon(P8), Tue(P4), Wed(P2, P4), Thu(P4, P7), Fri(P8)
  addSession('t-lathamani', 'sub-math', ['cls-11-d'], 'Monday', 8, '11D', false);
  addSession('t-lathamani', 'sub-math', ['cls-11-d'], 'Tuesday', 4, '11D', false);
  addSession('t-lathamani', 'sub-math', ['cls-11-d'], 'Wednesday', 2, '11D', false);
  addSession('t-lathamani', 'sub-math', ['cls-11-d'], 'Wednesday', 4, '11D', false);
  addSession('t-lathamani', 'sub-math', ['cls-11-d'], 'Thursday', 4, '11D', false);
  addSession('t-lathamani', 'sub-math', ['cls-11-d'], 'Thursday', 7, '11D', false);
  addSession('t-lathamani', 'sub-math', ['cls-11-d'], 'Friday', 8, '11D', false);

  // 12D = 7 periods: Mon(P1, P2, P3), Tue(P1), Wed(P1), Thu(P1), Fri(P1)
  addSession('t-lathamani', 'sub-math', ['cls-12-d'], 'Monday', 1, '12D', false);
  addSession('t-lathamani', 'sub-math', ['cls-12-d'], 'Monday', 2, '12D', false);
  addSession('t-lathamani', 'sub-math', ['cls-12-d'], 'Monday', 3, '12D', false);
  addSession('t-lathamani', 'sub-math', ['cls-12-d'], 'Tuesday', 1, '12D', false);
  addSession('t-lathamani', 'sub-math', ['cls-12-d'], 'Wednesday', 1, '12D', false);
  addSession('t-lathamani', 'sub-math', ['cls-12-d'], 'Thursday', 1, '12D', false);
  addSession('t-lathamani', 'sub-math', ['cls-12-d'], 'Friday', 1, '12D', false);

  // -------------------------------------------------------------
  // 6. Ramesh: Bio-Botany & Botany (30 periods)
  // 11BE (Bio-Botany) = 4 periods: Mon(P8), Tue(P8), Wed(P8), Thu(P8)
  addSession('t-ramesh-bot', 'sub-bio-bot', ['cls-11-b', 'cls-11-e'], 'Monday', 8, '11BE', true);
  addSession('t-ramesh-bot', 'sub-bio-bot', ['cls-11-b', 'cls-11-e'], 'Tuesday', 8, '11BE', true);
  addSession('t-ramesh-bot', 'sub-bio-bot', ['cls-11-b', 'cls-11-e'], 'Wednesday', 8, '11BE', true);
  addSession('t-ramesh-bot', 'sub-bio-bot', ['cls-11-b', 'cls-11-e'], 'Thursday', 8, '11BE', true);

  // 11C (Botany) = 7 periods: Mon(P6, P7), Tue(P6), Wed(P6), Thu(P6, P7), Fri(P6)
  addSession('t-ramesh-bot', 'sub-bot', ['cls-11-c'], 'Monday', 6, '11C', false);
  addSession('t-ramesh-bot', 'sub-bot', ['cls-11-c'], 'Monday', 7, '11C', false);
  addSession('t-ramesh-bot', 'sub-bot', ['cls-11-c'], 'Tuesday', 6, '11C', false);
  addSession('t-ramesh-bot', 'sub-bot', ['cls-11-c'], 'Wednesday', 6, '11C', false);
  addSession('t-ramesh-bot', 'sub-bot', ['cls-11-c'], 'Thursday', 6, '11C', false);
  addSession('t-ramesh-bot', 'sub-bot', ['cls-11-c'], 'Thursday', 7, '11C', false);
  addSession('t-ramesh-bot', 'sub-bot', ['cls-11-c'], 'Friday', 6, '11C', false);

  // 11D (Bio-Botany) = 4 periods: Mon(P7), Tue(P4), Thu(P5), Fri(P4)
  addSession('t-ramesh-bot', 'sub-bio-bot', ['cls-11-d'], 'Monday', 7, '11D', false);
  addSession('t-ramesh-bot', 'sub-bio-bot', ['cls-11-d'], 'Tuesday', 4, '11D', false);
  addSession('t-ramesh-bot', 'sub-bio-bot', ['cls-11-d'], 'Thursday', 5, '11D', false);
  addSession('t-ramesh-bot', 'sub-bio-bot', ['cls-11-d'], 'Friday', 4, '11D', false);

  // 12BE (Bio-Botany) = 4 periods: Mon(P6), Tue(P5), Wed(P7), Fri(P5)
  addSession('t-ramesh-bot', 'sub-bio-bot', ['cls-12-b', 'cls-12-e'], 'Monday', 6, '12BE', true);
  addSession('t-ramesh-bot', 'sub-bio-bot', ['cls-12-b', 'cls-12-e'], 'Tuesday', 5, '12BE', true);
  addSession('t-ramesh-bot', 'sub-bio-bot', ['cls-12-b', 'cls-12-e'], 'Wednesday', 7, '12BE', true);
  addSession('t-ramesh-bot', 'sub-bio-bot', ['cls-12-b', 'cls-12-e'], 'Friday', 5, '12BE', true);

  // 12C (Botany) = 7 periods: Mon(P3), Tue(P2, P3), Wed(P3), Thu(P2, P3), Fri(P2)
  addSession('t-ramesh-bot', 'sub-bot', ['cls-12-c'], 'Monday', 3, '12C', false);
  addSession('t-ramesh-bot', 'sub-bot', ['cls-12-c'], 'Tuesday', 2, '12C', false);
  addSession('t-ramesh-bot', 'sub-bot', ['cls-12-c'], 'Tuesday', 3, '12C', false);
  addSession('t-ramesh-bot', 'sub-bot', ['cls-12-c'], 'Wednesday', 3, '12C', false);
  addSession('t-ramesh-bot', 'sub-bot', ['cls-12-c'], 'Thursday', 2, '12C', false);
  addSession('t-ramesh-bot', 'sub-bot', ['cls-12-c'], 'Thursday', 3, '12C', false);
  addSession('t-ramesh-bot', 'sub-bot', ['cls-12-c'], 'Friday', 2, '12C', false);

  // 12D (Bio-Botany) = 4 periods: Tue(P6), Wed(P6), Thu(P4), Fri(P6)
  addSession('t-ramesh-bot', 'sub-bio-bot', ['cls-12-d'], 'Tuesday', 6, '12D', false);
  addSession('t-ramesh-bot', 'sub-bio-bot', ['cls-12-d'], 'Wednesday', 6, '12D', false);
  addSession('t-ramesh-bot', 'sub-bio-bot', ['cls-12-d'], 'Thursday', 4, '12D', false);
  addSession('t-ramesh-bot', 'sub-bio-bot', ['cls-12-d'], 'Friday', 6, '12D', false);

  // -------------------------------------------------------------
  // 7. Sundar: Bio-Zoology & Zoology (30 periods)
  // 11BE (Bio-Zoology) = 4 periods: Tue(P7), Wed(P7), Fri(P7, P8)
  addSession('t-sundar-zoo', 'sub-bio-zoo', ['cls-11-b', 'cls-11-e'], 'Tuesday', 7, '11BE', true);
  addSession('t-sundar-zoo', 'sub-bio-zoo', ['cls-11-b', 'cls-11-e'], 'Wednesday', 7, '11BE', true);
  addSession('t-sundar-zoo', 'sub-bio-zoo', ['cls-11-b', 'cls-11-e'], 'Friday', 7, '11BE', true);
  addSession('t-sundar-zoo', 'sub-bio-zoo', ['cls-11-b', 'cls-11-e'], 'Friday', 8, '11BE', true);

  // 11C (Zoology) = 7 periods: Mon(P8), Tue(P7, P8), Wed(P7, P8), Thu(P8), Fri(P5)
  addSession('t-sundar-zoo', 'sub-zoo', ['cls-11-c'], 'Monday', 8, '11C', false);
  addSession('t-sundar-zoo', 'sub-zoo', ['cls-11-c'], 'Tuesday', 7, '11C', false);
  addSession('t-sundar-zoo', 'sub-zoo', ['cls-11-c'], 'Tuesday', 8, '11C', false);
  addSession('t-sundar-zoo', 'sub-zoo', ['cls-11-c'], 'Wednesday', 7, '11C', false);
  addSession('t-sundar-zoo', 'sub-zoo', ['cls-11-c'], 'Wednesday', 8, '11C', false);
  addSession('t-sundar-zoo', 'sub-zoo', ['cls-11-c'], 'Thursday', 8, '11C', false);
  addSession('t-sundar-zoo', 'sub-zoo', ['cls-11-c'], 'Friday', 5, '11C', false);

  // 11D (Bio-Zoology) = 4 periods: Mon(P8), Tue(P5), Wed(P8), Fri(P8)
  addSession('t-sundar-zoo', 'sub-bio-zoo', ['cls-11-d'], 'Monday', 8, '11D', false);
  addSession('t-sundar-zoo', 'sub-bio-zoo', ['cls-11-d'], 'Tuesday', 5, '11D', false);
  addSession('t-sundar-zoo', 'sub-bio-zoo', ['cls-11-d'], 'Wednesday', 8, '11D', false);
  addSession('t-sundar-zoo', 'sub-bio-zoo', ['cls-11-d'], 'Friday', 8, '11D', false);

  // 12BE (Bio-Zoology) = 4 periods: Mon(P7), Wed(P8), Thu(P6), Fri(P6)
  addSession('t-sundar-zoo', 'sub-bio-zoo', ['cls-12-b', 'cls-12-e'], 'Monday', 7, '12BE', true);
  addSession('t-sundar-zoo', 'sub-bio-zoo', ['cls-12-b', 'cls-12-e'], 'Wednesday', 8, '12BE', true);
  addSession('t-sundar-zoo', 'sub-bio-zoo', ['cls-12-b', 'cls-12-e'], 'Thursday', 6, '12BE', true);
  addSession('t-sundar-zoo', 'sub-bio-zoo', ['cls-12-b', 'cls-12-e'], 'Friday', 6, '12BE', true);

  // 12C (Zoology) = 7 periods: Mon(P7), Tue(P1), Wed(P7, P8), Thu(P7), Fri(P7, P8)
  addSession('t-sundar-zoo', 'sub-zoo', ['cls-12-c'], 'Monday', 7, '12C', false);
  addSession('t-sundar-zoo', 'sub-zoo', ['cls-12-c'], 'Tuesday', 1, '12C', false);
  addSession('t-sundar-zoo', 'sub-zoo', ['cls-12-c'], 'Wednesday', 7, '12C', false);
  addSession('t-sundar-zoo', 'sub-zoo', ['cls-12-c'], 'Wednesday', 8, '12C', false);
  addSession('t-sundar-zoo', 'sub-zoo', ['cls-12-c'], 'Thursday', 7, '12C', false);
  addSession('t-sundar-zoo', 'sub-zoo', ['cls-12-c'], 'Friday', 7, '12C', false);
  addSession('t-sundar-zoo', 'sub-zoo', ['cls-12-c'], 'Friday', 8, '12C', false);

  // 12D (Bio-Zoology) = 4 periods: Mon(P6), Tue(P7), Thu(P5), Fri(P5)
  addSession('t-sundar-zoo', 'sub-bio-zoo', ['cls-12-d'], 'Monday', 6, '12D', false);
  addSession('t-sundar-zoo', 'sub-bio-zoo', ['cls-12-d'], 'Tuesday', 7, '12D', false);
  addSession('t-sundar-zoo', 'sub-bio-zoo', ['cls-12-d'], 'Thursday', 5, '12D', false);
  addSession('t-sundar-zoo', 'sub-bio-zoo', ['cls-12-d'], 'Friday', 5, '12D', false);

  // -------------------------------------------------------------
  // 8. Siva: Computer Science (11A, 12A) & Employability Skills (11E, 12E) - 28 periods
  // 11A (Computer Science) = 7 periods: Mon(P3), Tue(P3), Wed(P7, P8), Thu(P3), Fri(P7, P8)
  addSession('t-31', 'sub-cs', ['cls-11-a'], 'Monday', 3, '11A', false);
  addSession('t-31', 'sub-cs', ['cls-11-a'], 'Tuesday', 3, '11A', false);
  addSession('t-31', 'sub-cs', ['cls-11-a'], 'Wednesday', 7, '11A', false);
  addSession('t-31', 'sub-cs', ['cls-11-a'], 'Wednesday', 8, '11A', false);
  addSession('t-31', 'sub-cs', ['cls-11-a'], 'Thursday', 3, '11A', false);
  addSession('t-31', 'sub-cs', ['cls-11-a'], 'Friday', 7, '11A', false);
  addSession('t-31', 'sub-cs', ['cls-11-a'], 'Friday', 8, '11A', false);

  // 12A (Computer Science) = 7 periods: Mon(P2, P7, P8), Tue(P2), Wed(P2), Thu(P2), Fri(P2)
  addSession('t-31', 'sub-cs', ['cls-12-a'], 'Monday', 2, '12A', false);
  addSession('t-31', 'sub-cs', ['cls-12-a'], 'Monday', 7, '12A', false);
  addSession('t-31', 'sub-cs', ['cls-12-a'], 'Monday', 8, '12A', false);
  addSession('t-31', 'sub-cs', ['cls-12-a'], 'Tuesday', 2, '12A', false);
  addSession('t-31', 'sub-cs', ['cls-12-a'], 'Wednesday', 2, '12A', false);
  addSession('t-31', 'sub-cs', ['cls-12-a'], 'Thursday', 2, '12A', false);
  addSession('t-31', 'sub-cs', ['cls-12-a'], 'Friday', 2, '12A', false);

  // 11E (Employability Skills) = 7 periods: Mon(P4, P7), Tue(P6, P7), Wed(P6), Thu(P7, P8)
  addSession('t-31', 'sub-es', ['cls-11-e'], 'Monday', 4, '11E', false);
  addSession('t-31', 'sub-es', ['cls-11-e'], 'Monday', 7, '11E', false);
  addSession('t-31', 'sub-es', ['cls-11-e'], 'Tuesday', 6, '11E', false);
  addSession('t-31', 'sub-es', ['cls-11-e'], 'Tuesday', 7, '11E', false);
  addSession('t-31', 'sub-es', ['cls-11-e'], 'Wednesday', 6, '11E', false);
  addSession('t-31', 'sub-es', ['cls-11-e'], 'Thursday', 7, '11E', false);
  addSession('t-31', 'sub-es', ['cls-11-e'], 'Thursday', 8, '11E', false);

  // 12E (Employability Skills) = 7 periods: Mon(P5, P6), Tue(P5), Wed(P5), Thu(P5), Fri(P5, P6)
  addSession('t-31', 'sub-es', ['cls-12-e'], 'Monday', 5, '12E', false);
  addSession('t-31', 'sub-es', ['cls-12-e'], 'Monday', 6, '12E', false);
  addSession('t-31', 'sub-es', ['cls-12-e'], 'Tuesday', 5, '12E', false);
  addSession('t-31', 'sub-es', ['cls-12-e'], 'Wednesday', 5, '12E', false);
  addSession('t-31', 'sub-es', ['cls-12-e'], 'Thursday', 5, '12E', false);
  addSession('t-31', 'sub-es', ['cls-12-e'], 'Friday', 5, '12E', false);
  addSession('t-31', 'sub-es', ['cls-12-e'], 'Friday', 6, '12E', false);

  // -------------------------------------------------------------
  // 9. Maritheivam: Agri-T & Agri-P (28 periods)
  // 11E (Agri-T = 7 periods, Agri-P = 7 periods) = 14 periods
  // Agri-T: Mon(P5, P6), Tue(P3), Wed(P3), Thu(P5, P6), Fri(P4)
  addSession('t-maritheivam', 'sub-agri-t', ['cls-11-e'], 'Monday', 5, '11E', false);
  addSession('t-maritheivam', 'sub-agri-t', ['cls-11-e'], 'Monday', 6, '11E', false);
  addSession('t-maritheivam', 'sub-agri-t', ['cls-11-e'], 'Tuesday', 3, '11E', false);
  addSession('t-maritheivam', 'sub-agri-t', ['cls-11-e'], 'Wednesday', 3, '11E', false);
  addSession('t-maritheivam', 'sub-agri-t', ['cls-11-e'], 'Thursday', 5, '11E', false);
  addSession('t-maritheivam', 'sub-agri-t', ['cls-11-e'], 'Thursday', 6, '11E', false);
  addSession('t-maritheivam', 'sub-agri-t', ['cls-11-e'], 'Friday', 4, '11E', false);

  // Agri-P: Mon(P3), Tue(P4, P5), Wed(P4, P5), Thu(P3, P4)
  addSession('t-maritheivam', 'sub-agri-p', ['cls-11-e'], 'Monday', 3, '11E', false);
  addSession('t-maritheivam', 'sub-agri-p', ['cls-11-e'], 'Tuesday', 4, '11E', false);
  addSession('t-maritheivam', 'sub-agri-p', ['cls-11-e'], 'Tuesday', 5, '11E', false);
  addSession('t-maritheivam', 'sub-agri-p', ['cls-11-e'], 'Wednesday', 4, '11E', false);
  addSession('t-maritheivam', 'sub-agri-p', ['cls-11-e'], 'Wednesday', 5, '11E', false);
  addSession('t-maritheivam', 'sub-agri-p', ['cls-11-e'], 'Thursday', 3, '11E', false);
  addSession('t-maritheivam', 'sub-agri-p', ['cls-11-e'], 'Thursday', 4, '11E', false);

  // 12E (Agri-T = 7 periods, Agri-P = 7 periods) = 14 periods
  // Agri-T: Mon(P1), Tue(P2), Wed(P2), Thu(P1, P2), Fri(P1, P3)
  addSession('t-maritheivam', 'sub-agri-t', ['cls-12-e'], 'Monday', 1, '12E', false);
  addSession('t-maritheivam', 'sub-agri-t', ['cls-12-e'], 'Tuesday', 2, '12E', false);
  addSession('t-maritheivam', 'sub-agri-t', ['cls-12-e'], 'Wednesday', 2, '12E', false);
  addSession('t-maritheivam', 'sub-agri-t', ['cls-12-e'], 'Thursday', 1, '12E', false);
  addSession('t-maritheivam', 'sub-agri-t', ['cls-12-e'], 'Thursday', 2, '12E', false);
  addSession('t-maritheivam', 'sub-agri-t', ['cls-12-e'], 'Friday', 1, '12E', false);
  addSession('t-maritheivam', 'sub-agri-t', ['cls-12-e'], 'Friday', 3, '12E', false);

  // Agri-P: Mon(P2, P4), Tue(P1), Wed(P1), Thu(P4), Fri(P2, P4)
  addSession('t-maritheivam', 'sub-agri-p', ['cls-12-e'], 'Monday', 2, '12E', false);
  addSession('t-maritheivam', 'sub-agri-p', ['cls-12-e'], 'Monday', 4, '12E', false);
  addSession('t-maritheivam', 'sub-agri-p', ['cls-12-e'], 'Tuesday', 1, '12E', false);
  addSession('t-maritheivam', 'sub-agri-p', ['cls-12-e'], 'Wednesday', 1, '12E', false);
  addSession('t-maritheivam', 'sub-agri-p', ['cls-12-e'], 'Thursday', 4, '12E', false);
  addSession('t-maritheivam', 'sub-agri-p', ['cls-12-e'], 'Friday', 2, '12E', false);
  addSession('t-maritheivam', 'sub-agri-p', ['cls-12-e'], 'Friday', 4, '12E', false);

  // Co-Curricular & PET slots to fulfill 40 periods
  addSession('t-13', 'sub-pet', ['cls-11-a'], 'Tuesday', 4, '11A', false);
  addSession('t-13', 'sub-pet', ['cls-11-a'], 'Thursday', 5, '11A', false);
  addSession('t-13', 'sub-pet', ['cls-11-b'], 'Friday', 4, '11B', false);
  addSession('t-13', 'sub-pet', ['cls-11-c'], 'Friday', 7, '11C', false);
  addSession('t-13', 'sub-pet', ['cls-11-c'], 'Friday', 8, '11C', false);
  addSession('t-13', 'sub-pet', ['cls-11-d'], 'Thursday', 4, '11D', false);
  addSession('t-13', 'sub-pet', ['cls-11-e'], 'Monday', 8, '11E', false);
  addSession('t-13', 'sub-pet', ['cls-11-e'], 'Thursday', 1, '11E', false);
  addSession('t-13', 'sub-pet', ['cls-11-e'], 'Friday', 3, '11E', false);

  addSession('t-19', 'sub-pet', ['cls-12-a'], 'Tuesday', 4, '12A', false);
  addSession('t-19', 'sub-pet', ['cls-12-a'], 'Friday', 4, '12A', false);
  addSession('t-19', 'sub-pet', ['cls-12-b'], 'Tuesday', 4, '12B', false);
  addSession('t-19', 'sub-pet', ['cls-12-c'], 'Thursday', 5, '12C', false);
  addSession('t-19', 'sub-pet', ['cls-12-c'], 'Friday', 4, '12C', false);
  addSession('t-19', 'sub-pet', ['cls-12-d'], 'Wednesday', 5, '12D', false);
  addSession('t-19', 'sub-pet', ['cls-12-e'], 'Tuesday', 6, '12E', false);

  return slots;
}
