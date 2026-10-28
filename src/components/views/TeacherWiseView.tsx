import React, { useState } from 'react';
import {
  TimetableSlot,
  ClassSection,
  Teacher,
  Subject,
  SchoolConfig,
  DayOfWeek,
} from '../../types/timetable';
import {
  Printer,
  User,
  Sliders,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  Clock,
  Sparkles,
  Users2,
  UserCheck,
  FlaskConical,
} from 'lucide-react';
import { LanguageMode } from '../Header';

interface TeacherWiseViewProps {
  config: SchoolConfig;
  slots: TimetableSlot[];
  classes: ClassSection[];
  teachers: Teacher[];
  subjects: Subject[];
  languageMode: LanguageMode;
  onSelectSlot: (classId: string, day: DayOfWeek, period: number) => void;
}

export const TeacherWiseView: React.FC<TeacherWiseViewProps> = ({
  config,
  slots,
  classes,
  teachers,
  subjects,
  languageMode,
  onSelectSlot,
}) => {
  // Find Subbulakshmi or Siva if available, or default to first teacher
  const defaultTeacherId =
    teachers.find(t => t.id === 't-subbulakshmi' || t.name.toLowerCase().includes('subbulakshmi'))?.id ||
    teachers.find(t => t.id === 't-31' || t.name.toLowerCase().includes('siva'))?.id ||
    teachers[0]?.id ||
    'all';

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(defaultTeacherId);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [showSubjectInCell, setShowSubjectInCell] = useState<boolean>(false);
  const [signatureDate, setSignatureDate] = useState<string>('2/6/26');
  const [quickGroupFilter, setQuickGroupFilter] = useState<'all' | 'combine' | 'individual'>('all');

  const isTa = languageMode === 'ta';

  const dayNamesShort: Record<DayOfWeek, string> = {
    Monday: 'MON',
    Tuesday: 'TUE',
    Wednesday: 'WED',
    Thursday: 'THU',
    Friday: 'FRI',
    Saturday: 'SAT',
  };

  const dayNamesTamilShort: Record<DayOfWeek, string> = {
    Monday: 'திங்கள்',
    Tuesday: 'செவ்வாய்',
    Wednesday: 'புதன்',
    Thursday: 'வியாழன்',
    Friday: 'வெள்ளி',
    Saturday: 'சனி',
  };

  const classMap = new Map<string, ClassSection>(classes.map(c => [c.id, c]));
  const subjectMap = new Map<string, Subject>(subjects.map(s => [s.id, s]));

  const departments = Array.from(new Set(teachers.map(t => t.department))).filter(Boolean);

  // Group IDs for Combined vs Individual teachers
  const combineTeacherIds = [
    't-subbulakshmi',
    't-pradeepa',
    't-gowri',
    't-nithya',
    't-lathamani',
    't-ramesh-bot',
    't-sundar-zoo',
  ];

  const individualTeacherIds = [
    't-31',
    't-maritheivam',
  ];

  // User's exact prompt specifications for Total Periods and Allocation Rules
  const officialTeacherAllocations: Record<string, { total: number; type: 'combine' | 'individual'; rules: string[] }> = {
    't-subbulakshmi': {
      total: 29,
      type: 'combine',
      rules: ['11A,B,C=5', '12A,B,C=5', '11D=5', '12D=5', '11E=4', '12E=5'],
    },
    't-pradeepa': {
      total: 29,
      type: 'combine',
      rules: ['11A,B,C=5', '12A,B,C=5', '11D=5', '12D=5', '11E=4', '12E=5'],
    },
    't-gowri': {
      total: 28,
      type: 'combine',
      rules: ['11ABC=7', '12ABC=7', '11D=7', '12D=7'],
    },
    't-nithya': {
      total: 28,
      type: 'combine',
      rules: ['11ABC=7', '12ABC=7', '11D=7', '12D=7'],
    },
    't-lathamani': {
      total: 28,
      type: 'combine',
      rules: ['11AB=7', '12AB=7', '11D=7', '12D=7'],
    },
    't-ramesh-bot': {
      total: 30,
      type: 'combine',
      rules: ['11BE=4', '11C=7', '11D=4', '12BE=4', '12C=7', '12D=4'],
    },
    't-sundar-zoo': {
      total: 30,
      type: 'combine',
      rules: ['11BE=4', '11C=7', '11D=4', '12BE=4', '12C=7', '12D=4'],
    },
    't-31': {
      total: 28,
      type: 'individual',
      rules: ['11A (CS)=7', '11E (ES)=7', '12A (CS)=7', '12E (ES)=7'],
    },
    't-maritheivam': {
      total: 28,
      type: 'individual',
      rules: ['11E (Agri-T & Agri-P)=14', '12E (Agri-T & Agri-P)=14'],
    },
  };

  let filteredTeachers = teachers;
  if (quickGroupFilter === 'combine') {
    filteredTeachers = filteredTeachers.filter(t =>
      combineTeacherIds.includes(t.id) ||
      t.name.toLowerCase().includes('subbu') ||
      t.name.toLowerCase().includes('pradee') ||
      t.name.toLowerCase().includes('gowri') ||
      t.name.toLowerCase().includes('nithya') ||
      t.name.toLowerCase().includes('latha') ||
      t.name.toLowerCase().includes('ramesh') ||
      t.name.toLowerCase().includes('sundar')
    );
  } else if (quickGroupFilter === 'individual') {
    filteredTeachers = filteredTeachers.filter(t =>
      individualTeacherIds.includes(t.id) ||
      t.name.toLowerCase().includes('siva') ||
      t.name.toLowerCase().includes('mari')
    );
  }

  if (selectedDept !== 'all') {
    filteredTeachers = filteredTeachers.filter(t => t.department === selectedDept);
  }
  if (viewMode === 'single' && selectedTeacherId !== 'all') {
    filteredTeachers = filteredTeachers.filter(t => t.id === selectedTeacherId);
  }

  // Helper to format class name cleanly like "12 A", "11 A", "11 E", "12 E"
  const formatClassShort = (cls?: ClassSection | null): string => {
    if (!cls) return '';
    const section = cls.section ? cls.section.trim() : 'A';
    return `${cls.grade} ${section}`;
  };

  const activeDays = config.days;

  return (
    <div className="space-y-6">
      {/* Top Filter and Customization Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-700" />
                <span>
                  {isTa ? 'ஆசிரியர் தனி நபர் கால அட்டவணை அட்டை (Slip View)' : 'TEACHER INDIVIDUAL TIMETABLE SLIP'}
                </span>
              </h2>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {isTa ? 'அசல் படிவ வடிவம் (Photo Replica)' : 'Authentic Slip Replica'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isTa
                ? 'தமிழ்நாடு அரசுப் பள்ளி அசல் ஆசிரியர் கால அட்டவணை அட்டை (ரோமன் எண்கள் I-VIII, இடைவேளை & உணவு இடைவேளை, இணைக்கப்பட்ட வகுப்புகள்).'
                : 'School timetable slip with Roman periods I-VIII, Morning Interval, Lunch Break, Combined Classes & Principal Signature.'}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Mode toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  viewMode === 'single'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isTa ? 'தனி அட்டை' : 'Single Slip'}
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  viewMode === 'all'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isTa ? 'அனைத்து ஆசிரியர்கள் (Batch)' : 'All Teachers (Batch)'}
              </button>
            </div>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={e => {
                setSelectedDept(e.target.value);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">{isTa ? 'அனைத்துத் துறைகள்' : 'All Departments'}</option>
              {departments.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Teacher Selector */}
            {viewMode === 'single' && (
              <select
                value={selectedTeacherId}
                onChange={e => setSelectedTeacherId(e.target.value)}
                className="text-xs bg-slate-50 border border-blue-300 font-semibold text-blue-900 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600 max-w-[220px]"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.code}: {t.name} ({t.department})
                  </option>
                ))}
              </select>
            )}

            {/* Toggle details in cells */}
            <button
              onClick={() => setShowSubjectInCell(!showSubjectInCell)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                showSubjectInCell
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Toggle subject name display in cells"
            >
              {showSubjectInCell ? (isTa ? 'பாடம் தெரியும்' : '+ Subjects On') : (isTa ? 'வகுப்பு மட்டும்' : 'Class Only (Photo Style)')}
            </button>

            {/* Date Stamp input */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
              <span className="text-slate-400 font-mono text-[10px]">Date:</span>
              <input
                type="text"
                value={signatureDate}
                onChange={e => setSignatureDate(e.target.value)}
                className="w-16 bg-transparent font-mono font-semibold text-slate-800 focus:outline-none"
                placeholder="2/6/26"
              />
            </div>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-900 hover:bg-blue-800 text-white shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isTa ? 'அச்சிடுக' : 'Print Slip'}</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Row for Class Combine & Individual Higher Secondary Faculty */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mr-1">
              {isTa ? 'வகுப்பு ஒதுக்கீடு பிரிவு:' : 'Allocation Category:'}
            </span>

            <button
              onClick={() => {
                setQuickGroupFilter('combine');
                if (viewMode === 'single') setSelectedTeacherId('t-subbulakshmi');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                quickGroupFilter === 'combine'
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              <Users2 className="w-3.5 h-3.5" />
              <span>{isTa ? 'வகுப்பு இணைப்பு ஆசிரியர்கள் (Class Combine - 7 பேர்)' : 'Class Combine Faculty (7 Teachers)'}</span>
            </button>

            <button
              onClick={() => {
                setQuickGroupFilter('individual');
                if (viewMode === 'single') setSelectedTeacherId('t-31');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                quickGroupFilter === 'individual'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isTa ? 'தனி வகுப்பு ஆசிரியர்கள் (Class Individual - 2 பேர்)' : 'Class Individual Faculty (2 Teachers)'}</span>
            </button>

            <button
              onClick={() => setQuickGroupFilter('all')}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                quickGroupFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isTa ? 'அனைத்து ஆசிரியர்கள்' : 'All Teachers'}
            </button>
          </div>

          {/* Quick Teacher Switcher Pills */}
          <div className="flex items-center flex-wrap gap-1">
            {[
              { id: 't-subbulakshmi', label: 'Subbulakshmi', role: 'Tamil' },
              { id: 't-pradeepa', label: 'Pradeepa', role: 'English' },
              { id: 't-gowri', label: 'Gowri', role: 'Physics' },
              { id: 't-nithya', label: 'Nithya', role: 'Chemistry' },
              { id: 't-lathamani', label: 'Lathamani', role: 'Maths' },
              { id: 't-ramesh-bot', label: 'Ramesh', role: 'Botany' },
              { id: 't-sundar-zoo', label: 'Sundar', role: 'Zoology' },
              { id: 't-31', label: 'Siva', role: 'CS & ES' },
              { id: 't-maritheivam', label: 'Maritheivam', role: 'Agri' },
            ].map(teacherPill => {
              const teacherObj = teachers.find(t => t.id === teacherPill.id);
              if (!teacherObj) return null;
              const isSelected = selectedTeacherId === teacherObj.id;

              // Dynamically count distinct teaching sessions for live feedback
              const liveSessionsCount = new Set(
                slots.filter(s => s.teacherId === teacherObj.id).map(s => `${s.day}_${s.period}`)
              ).size;

              return (
                <button
                  key={teacherPill.id}
                  onClick={() => {
                    setSelectedTeacherId(teacherObj.id);
                    setViewMode('single');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-blue-50 text-slate-700 border border-slate-200'
                  }`}
                  title={`${teacherObj.name} (${teacherPill.role}) · Live: ${liveSessionsCount} Periods`}
                >
                  {teacherPill.label} ({liveSessionsCount}p)
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RENDER INDIVIDUAL TEACHER TIMETABLE SLIP(S) */}
      <div className="space-y-10">
        {filteredTeachers.map(teacher => {
          const teacherSlots = slots.filter(s => s.teacherId === teacher.id);

          // Calculate unique teaching sessions (day + period) so combined classes count as 1 period
          const distinctTeachingSessions = new Set<string>();
          teacherSlots.forEach(s => distinctTeachingSessions.add(`${s.day}_${s.period}`));
          const totalAssigned = distinctTeachingSessions.size;

          const totalPeriodsAvailable = config.defaultPeriodsPerDay * activeDays.length;
          const freeCount = Math.max(0, totalPeriodsAvailable - totalAssigned);

          // Format designation (e.g. (PG), (BT), (SGT))
          const designation = teacher.department.toLowerCase().includes('pg') || teacher.name.toLowerCase().includes('pg')
            ? '(PG)'
            : teacher.department.toLowerCase().includes('pet')
            ? '(PET)'
            : teacher.department.toLowerCase().includes('spark')
            ? '(SPARK)'
            : '(BT)';

          return (
            <div
              key={teacher.id}
              className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-slate-800 shadow-lg max-w-4xl mx-auto break-inside-avoid print:shadow-none print:border-black print:p-2 print:my-4 print:max-w-none"
            >
              {/* Slip Card Top Header matching uploaded photo */}
              <div className="border-b-2 border-slate-900 pb-2 mb-0 flex flex-wrap items-center justify-between text-slate-900 font-sans">
                {/* Teacher Name on Left */}
                <div className="text-left">
                  <h3 className="font-extrabold text-base sm:text-xl tracking-tight text-slate-950 font-serif">
                    {teacher.name}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-600 font-semibold">
                    {teacher.code} · {teacher.department}
                  </div>
                </div>

                {/* School Name & Institutional Title Center */}
                <div className="text-center hidden sm:block">
                  <div className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-800">
                    {config.schoolName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    ACADEMIC TIME TABLE · {config.academicYear}
                  </div>
                </div>

                {/* Designation on Right */}
                <div className="text-right">
                  <span className="font-bold text-base sm:text-lg font-serif text-slate-900">
                    {designation}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {totalAssigned} Periods/Wk
                  </div>
                </div>
              </div>

              {/* Teacher Multi-Subject & Class Assignment Bar */}
              {(() => {
                // Group distinct sessions by subject and class/combined label
                const sessionBreakdown = new Map<
                  string,
                  { subject: Subject; classLabel: string; periods: number; isCombined: boolean }
                >();

                // Build unique session list
                const seenSessions = new Set<string>();
                teacherSlots.forEach(s => {
                  const sessKey = `${s.day}_${s.period}`;
                  if (seenSessions.has(sessKey)) return;
                  seenSessions.add(sessKey);

                  const sub = subjectMap.get(s.subjectId);
                  if (!sub) return;
                  const label = s.combinedLabel || formatClassShort(classMap.get(s.classId)) || s.classId;
                  const groupKey = `${sub.id}_${label}`;

                  if (!sessionBreakdown.has(groupKey)) {
                    sessionBreakdown.set(groupKey, {
                      subject: sub,
                      classLabel: label,
                      periods: 1,
                      isCombined: Boolean(s.isCombined),
                    });
                  } else {
                    sessionBreakdown.get(groupKey)!.periods++;
                  }
                });

                const breakdownList = Array.from(sessionBreakdown.values());

                return (
                  <div className="bg-slate-50 border-b-2 border-slate-900 py-1.5 px-3 flex flex-wrap items-center justify-between text-xs text-slate-700 gap-2 font-sans mb-1">
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wide">
                        {isTa ? 'பாடங்கள் & வகுப்புகள்:' : 'Subjects & Classes:'}
                      </span>
                      {breakdownList.length > 0 ? (
                        breakdownList.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: item.subject.color }}
                          >
                            <span>{item.subject.code}: {item.classLabel}</span>
                            <span className="bg-black/30 px-1 py-0.2 rounded text-[10px] font-mono">
                              {item.periods}p
                            </span>
                            {item.isCombined && (
                              <span className="bg-white/30 text-[9px] px-1 py-0.2 rounded uppercase font-semibold">
                                Combine
                              </span>
                            )}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No classes assigned</span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-700 font-semibold shrink-0">
                      <span className="font-extrabold text-blue-900">{totalAssigned}</span> / {teacher.maxWeeklyLoad} {isTa ? 'பாடவேளைகள்' : 'Periods/Wk'}
                    </div>
                  </div>
                );
              })()}

              {/* Live Period Breakdown Banner for Class Combine & Individual Teachers */}
              {officialTeacherAllocations[teacher.id] && (() => {
                // Dynamically compute live class breakdown from teacherSlots
                const liveClassCounts = new Map<string, number>();
                const seenKeys = new Set<string>();
                teacherSlots.forEach(s => {
                  const key = `${s.day}_${s.period}`;
                  if (seenKeys.has(key)) return;
                  seenKeys.add(key);
                  const label = s.combinedLabel || formatClassShort(classMap.get(s.classId)) || s.classId;
                  const sub = subjectMap.get(s.subjectId);
                  const groupKey = s.isCombined ? label : `${label}${sub ? ` (${sub.code})` : ''}`;
                  liveClassCounts.set(groupKey, (liveClassCounts.get(groupKey) || 0) + 1);
                });
                const dynamicRules = Array.from(liveClassCounts.entries()).map(([grp, count]) => `${grp}=${count}`);
                const targetTotal = officialTeacherAllocations[teacher.id].total;
                const isOnTarget = totalAssigned === targetTotal;

                return (
                  <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border-b-2 border-slate-900 py-1.5 px-3 flex flex-wrap items-center justify-between text-[11px] gap-2 mb-1">
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span
                        className={`font-bold font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow-2xs ${
                          officialTeacherAllocations[teacher.id].type === 'combine'
                            ? 'bg-indigo-900 text-white'
                            : 'bg-emerald-900 text-white'
                        }`}
                      >
                        {officialTeacherAllocations[teacher.id].type === 'combine'
                          ? (isTa ? 'வகுப்பு இணைப்பு ஒதுக்கீடு (Live)' : 'Class Combine Allocations')
                          : (isTa ? 'தனி வகுப்பு ஒதுக்கீடு (Live)' : 'Class Individual Allocations')}
                      </span>
                      <div className="flex items-center flex-wrap gap-1">
                        {(dynamicRules.length > 0 ? dynamicRules : officialTeacherAllocations[teacher.id].rules).map((rule, rIdx) => (
                          <span
                            key={rIdx}
                            className="bg-white border border-slate-300 px-1.5 py-0.2 rounded text-slate-800 font-mono font-bold text-[10px] shadow-2xs"
                          >
                            {rule}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div
                        className={`font-mono font-extrabold text-xs px-2.5 py-0.5 rounded border shadow-2xs flex items-center gap-1 ${
                          isOnTarget
                            ? 'bg-amber-300 border-amber-400 text-blue-950'
                            : totalAssigned > targetTotal
                            ? 'bg-rose-100 border-rose-300 text-rose-900'
                            : 'bg-sky-100 border-sky-300 text-sky-900'
                        }`}
                      >
                        <span>{isTa ? 'மொத்த பாடவேளைகள்' : 'Total Periods'} = {totalAssigned}</span>
                        <span className="text-[10px] font-medium opacity-80">({targetTotal}p Target)</span>
                        {isOnTarget && <span className="text-emerald-700">✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Exact Timetable Grid matching uploaded photo replica */}
              <div className="overflow-x-auto">
                <table className="w-full border-2 border-slate-900 border-collapse text-xs select-none">
                  <thead>
                    {/* Header Row: DAY | I | II | INTERVAL | III | IV | LUNCH BREAK | V | VI | INTERVAL | VII | VIII */}
                    <tr className="bg-slate-200/90 text-slate-900 divide-x-2 divide-slate-900 border-b-2 border-slate-900 text-center font-sans font-bold">
                      <th className="py-2.5 px-3 uppercase tracking-wider w-16 text-center text-xs sm:text-sm font-black">
                        DAY
                      </th>

                      {/* Period I */}
                      <th className="py-1 px-1.5 sm:px-2 w-16 sm:w-20">
                        <div className="text-sm sm:text-base font-black font-serif">I</div>
                        <div className="text-[9px] sm:text-[10px] font-mono font-medium text-slate-700 whitespace-nowrap">
                          9.30-10.15
                        </div>
                      </th>

                      {/* Period II */}
                      <th className="py-1 px-1.5 sm:px-2 w-16 sm:w-20">
                        <div className="text-sm sm:text-base font-black font-serif">II</div>
                        <div className="text-[9px] sm:text-[10px] font-mono font-medium text-slate-700 whitespace-nowrap">
                          10.15-11.00
                        </div>
                      </th>

                      {/* Morning INTERVAL Header */}
                      <th className="py-1 px-1 w-9 sm:w-11 bg-slate-300/80 text-center border-l-2 border-r-2 border-slate-900">
                        <div className="text-[8px] sm:text-[9px] font-mono font-bold leading-tight text-slate-700 [writing-mode:vertical-rl] rotate-180 mx-auto py-1 whitespace-nowrap">
                          11.00 - 11.10
                        </div>
                      </th>

                      {/* Period III */}
                      <th className="py-1 px-1.5 sm:px-2 w-16 sm:w-20">
                        <div className="text-sm sm:text-base font-black font-serif">III</div>
                        <div className="text-[9px] sm:text-[10px] font-mono font-medium text-slate-700 whitespace-nowrap">
                          11.10-11.55
                        </div>
                      </th>

                      {/* Period IV */}
                      <th className="py-1 px-1.5 sm:px-2 w-16 sm:w-20">
                        <div className="text-sm sm:text-base font-black font-serif">IV</div>
                        <div className="text-[9px] sm:text-[10px] font-mono font-medium text-slate-700 whitespace-nowrap">
                          11.55-12.40
                        </div>
                      </th>

                      {/* LUNCH BREAK Header */}
                      <th className="py-1 px-1 w-10 sm:w-12 bg-slate-300/90 text-center border-l-2 border-r-2 border-slate-900">
                        <div className="text-[8px] sm:text-[9px] font-mono font-bold leading-tight text-slate-800 [writing-mode:vertical-rl] rotate-180 mx-auto py-1 whitespace-nowrap">
                          12.40 - 01.20
                        </div>
                      </th>

                      {/* Period V */}
                      <th className="py-1 px-1.5 sm:px-2 w-16 sm:w-20">
                        <div className="text-sm sm:text-base font-black font-serif">V</div>
                        <div className="text-[9px] sm:text-[10px] font-mono font-medium text-slate-700 whitespace-nowrap">
                          01.20-02.00
                        </div>
                      </th>

                      {/* Period VI */}
                      <th className="py-1 px-1.5 sm:px-2 w-16 sm:w-20">
                        <div className="text-sm sm:text-base font-black font-serif">VI</div>
                        <div className="text-[9px] sm:text-[10px] font-mono font-medium text-slate-700 whitespace-nowrap">
                          02.00-02.40
                        </div>
                      </th>

                      {/* Afternoon INTERVAL Header */}
                      <th className="py-1 px-1 w-9 sm:w-11 bg-slate-300/80 text-center border-l-2 border-r-2 border-slate-900">
                        <div className="text-[8px] sm:text-[9px] font-mono font-bold leading-tight text-slate-700 [writing-mode:vertical-rl] rotate-180 mx-auto py-1 whitespace-nowrap">
                          02.40 - 02.50
                        </div>
                      </th>

                      {/* Period VII */}
                      <th className="py-1 px-1.5 sm:px-2 w-16 sm:w-20">
                        <div className="text-sm sm:text-base font-black font-serif">VII</div>
                        <div className="text-[9px] sm:text-[10px] font-mono font-medium text-slate-700 whitespace-nowrap">
                          02.50-03.30
                        </div>
                      </th>

                      {/* Period VIII */}
                      <th className="py-1 px-1.5 sm:px-2 w-16 sm:w-20">
                        <div className="text-sm sm:text-base font-black font-serif">VIII</div>
                        <div className="text-[9px] sm:text-[10px] font-mono font-medium text-slate-700 whitespace-nowrap">
                          03.30-04.10
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y-2 divide-slate-900 font-sans">
                    {activeDays.map((day, dayIndex) => {
                      const dayLabel = dayNamesShort[day] || day.slice(0, 3).toUpperCase();

                      // Slots for this teacher on this day (take first slot in period if multiple due to class combine)
                      const getSlotForPeriod = (pNum: number) =>
                        teacherSlots.find(s => s.day === day && s.period === pNum);

                      const slotP1 = getSlotForPeriod(1);
                      const slotP2 = getSlotForPeriod(2);
                      const slotP3 = getSlotForPeriod(3);
                      const slotP4 = getSlotForPeriod(4);
                      const slotP5 = getSlotForPeriod(5);
                      const slotP6 = getSlotForPeriod(6);
                      const slotP7 = getSlotForPeriod(7);
                      const slotP8 = getSlotForPeriod(8);

                      // Helper to render class cell with combined label support
                      const renderClassCell = (slot?: TimetableSlot, pNum?: number) => {
                        const cls = slot?.classId ? classMap.get(slot.classId) : null;
                        const subject = slot?.subjectId ? subjectMap.get(slot.subjectId) : null;

                        // Display text: either the combined label (e.g. 11A,B,C or 12ABC) or individual class (e.g. 11 A)
                        const text = slot?.combinedLabel
                          ? slot.combinedLabel
                          : formatClassShort(cls);

                        return (
                          <td
                            key={pNum}
                            onClick={() => {
                              if (slot) onSelectSlot(slot.classId, day, pNum!);
                            }}
                            className={`py-2 px-1 text-center font-bold text-slate-900 transition-colors ${
                              slot
                                ? 'bg-white hover:bg-blue-50 cursor-pointer font-sans'
                                : 'bg-white text-transparent'
                            }`}
                            title={
                              slot
                                ? `${text} · ${subject?.name}${slot.isCombined ? ' (Combined Class)' : ''}`
                                : `Free Period (Click to allot)`
                            }
                          >
                            {slot ? (
                              <div>
                                <div className="flex items-center justify-center gap-1">
                                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-950 block whitespace-nowrap">
                                    {text}
                                  </span>
                                  {subject?.isPractical && (
                                    <span title={isTa ? 'செய்முறை வகுப்பு (Practical)' : 'Practical / Lab'}>
                                      <FlaskConical className="w-3 h-3 text-emerald-700 shrink-0 inline" />
                                    </span>
                                  )}
                                </div>
                                {showSubjectInCell && subject && (
                                  <span className="text-[9px] text-slate-500 font-normal block truncate max-w-[75px] mx-auto">
                                    {subject.code}{subject.isPractical ? ' (Prac)' : ''}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-transparent">-</span>
                            )}
                          </td>
                        );
                      };

                      return (
                        <tr
                          key={day}
                          className="divide-x-2 divide-slate-900 hover:bg-slate-50/50 transition-colors"
                        >
                          {/* DAY Column Header: MON, TUE, WED, THU, FRI */}
                          <td className="py-2.5 px-2 font-black font-sans text-xs sm:text-sm text-center text-slate-950 bg-slate-100/90 whitespace-nowrap">
                            {dayLabel}
                          </td>

                          {/* Period I */}
                          {renderClassCell(slotP1, 1)}

                          {/* Period II */}
                          {renderClassCell(slotP2, 2)}

                          {/* MORNING INTERVAL (11.00 - 11.10) - Spans all days */}
                          {dayIndex === 0 && (
                            <td
                              rowSpan={activeDays.length}
                              className="bg-slate-200/90 text-center font-extrabold text-slate-800 tracking-widest border-l-2 border-r-2 border-slate-900 select-none p-1"
                            >
                              <div className="[writing-mode:vertical-rl] rotate-180 mx-auto text-xs sm:text-sm tracking-[0.25em] font-sans font-black uppercase text-slate-800">
                                INTERVAL
                              </div>
                            </td>
                          )}

                          {/* Period III */}
                          {renderClassCell(slotP3, 3)}

                          {/* Period IV */}
                          {renderClassCell(slotP4, 4)}

                          {/* LUNCH BREAK (12.40 - 01.20) - Spans all days */}
                          {dayIndex === 0 && (
                            <td
                              rowSpan={activeDays.length}
                              className="bg-slate-300/90 text-center font-extrabold text-slate-900 tracking-widest border-l-2 border-r-2 border-slate-900 select-none p-1"
                            >
                              <div className="[writing-mode:vertical-rl] rotate-180 mx-auto text-xs sm:text-sm tracking-[0.25em] font-sans font-black uppercase text-slate-900">
                                LUNCH BREAK
                              </div>
                            </td>
                          )}

                          {/* Period V */}
                          {renderClassCell(slotP5, 5)}

                          {/* Period VI */}
                          {renderClassCell(slotP6, 6)}

                          {/* AFTERNOON INTERVAL (02.40 - 02.50) - Spans all days */}
                          {dayIndex === 0 && (
                            <td
                              rowSpan={activeDays.length}
                              className="bg-slate-200/90 text-center font-extrabold text-slate-800 tracking-widest border-l-2 border-r-2 border-slate-900 select-none p-1"
                            >
                              <div className="[writing-mode:vertical-rl] rotate-180 mx-auto text-xs sm:text-sm tracking-[0.25em] font-sans font-black uppercase text-slate-800">
                                INTERVAL
                              </div>
                            </td>
                          )}

                          {/* Period VII */}
                          {renderClassCell(slotP7, 7)}

                          {/* Period VIII */}
                          {renderClassCell(slotP8, 8)}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Section: Load Stats Left & Principal Signature Right (Exact match to uploaded image) */}
              <div className="mt-4 pt-3 flex flex-wrap items-end justify-between gap-4 text-xs">
                {/* Left: Summary Load Badge */}
                <div className="text-slate-600 space-y-1">
                  <div className="font-mono text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold border border-blue-300">
                      Total: {totalAssigned} Periods / Week
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-300">
                      Free: {freeCount} Periods
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Tamil Nadu School Education Department (40 Periods Norm)
                  </div>
                </div>

                {/* Right: Signature Seal & Handwritten Green Date Stamp (Exact match to uploaded image) */}
                <div className="text-right flex flex-col items-end pr-2">
                  <div className="flex items-center gap-2 font-mono text-emerald-800 font-bold text-base sm:text-lg italic tracking-tight mb-1 select-none">
                    <span className="text-2xl font-serif text-emerald-700 leading-none">✍️</span>
                    <span className="border-b-2 border-emerald-700 pb-0.5 font-serif font-black text-emerald-800">
                      d/ {signatureDate}
                    </span>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
                    Headmaster / Principal
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Signature & Office Seal
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
