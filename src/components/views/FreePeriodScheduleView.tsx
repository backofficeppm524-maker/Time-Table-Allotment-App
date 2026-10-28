import React, { useState } from 'react';
import {
  Teacher,
  TimetableSlot,
  ClassSection,
  Subject,
  DayOfWeek,
  SchoolConfig,
  SubstitutionAssignment,
} from '../../types/timetable';
import { calculateTeacherFreePeriods } from '../../utils/timetableGenerator';
import {
  UserCheck,
  UserMinus,
  Plus,
  Printer,
  Check,
  Search,
  CalendarDays,
  Pencil,
  Sliders,
  Sparkles,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { LanguageMode } from '../Header';
import { EditTeacherFreePeriodsModal } from '../modals/EditTeacherFreePeriodsModal';

interface FreePeriodScheduleViewProps {
  config: SchoolConfig;
  teachers: Teacher[];
  slots: TimetableSlot[];
  classes: ClassSection[];
  subjects: Subject[];
  substitutions: SubstitutionAssignment[];
  languageMode: LanguageMode;
  onAddSubstitution: (sub: SubstitutionAssignment) => void;
  onRemoveSubstitution: (id: string) => void;
  onUpdateSlots?: (updatedSlots: TimetableSlot[]) => void;
  onUpdateTeacher?: (teacher: Teacher) => void;
}

export const FreePeriodScheduleView: React.FC<FreePeriodScheduleViewProps> = ({
  config,
  teachers,
  slots,
  classes,
  subjects,
  substitutions,
  languageMode,
  onAddSubstitution,
  onRemoveSubstitution,
  onUpdateSlots,
  onUpdateTeacher,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'proxy'>('schedule');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [quickEditMode, setQuickEditMode] = useState<boolean>(false);

  // Editing state for Teacher Free Periods Modal
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editingDay, setEditingDay] = useState<DayOfWeek>('Monday');

  const isTa = languageMode === 'ta';

  // Proxy arranger state
  const [absentTeacherId, setAbsentTeacherId] = useState<string>('t-2');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [proxyDate, setProxyDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const teacherMap = new Map<string, Teacher>(teachers.map(t => [t.id, t]));
  const classMap = new Map<string, ClassSection>(classes.map(c => [c.id, c]));
  const subjectMap = new Map<string, Subject>(subjects.map(s => [s.id, s]));

  const maxPeriods = config.defaultPeriodsPerDay || 8;

  // Calculate free periods
  const freePeriodMap = calculateTeacherFreePeriods(
    teachers,
    slots,
    config.days,
    maxPeriods
  );

  const dayNamesTamil: Record<DayOfWeek, string> = {
    Monday: 'திங்கள்',
    Tuesday: 'செவ்வாய்',
    Wednesday: 'புதன்',
    Thursday: 'வியாழன்',
    Friday: 'வெள்ளி',
    Saturday: 'சனி',
  };

  // Affected periods for absent teacher on chosen day
  const affectedSlots = slots
    .filter(s => s.teacherId === absentTeacherId && s.day === selectedDay)
    .sort((a, b) => a.period - b.period);

  const absentTeacher = teacherMap.get(absentTeacherId);

  // Unique departments for filter
  const departments = Array.from(new Set(teachers.map(t => t.department))).filter(Boolean);

  // Filtered teachers list for search
  const filteredTeachers = teachers.filter(t => {
    const matchesQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.nameTamil && t.nameTamil.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = departmentFilter === 'all' || t.department === departmentFilter;

    return matchesQuery && matchesDept;
  });

  // Calculate overall free periods count across all faculty
  let totalFreePeriodsAllTeachers = 0;
  Object.values(freePeriodMap).forEach(dayObj => {
    Object.values(dayObj).forEach(periods => {
      totalFreePeriodsAllTeachers += periods.length;
    });
  });

  const handleOpenEdit = (teacher: Teacher, day: DayOfWeek = 'Monday') => {
    setEditingTeacher(teacher);
    setEditingDay(day);
  };

  const handleSlotsUpdated = (updatedSlots: TimetableSlot[]) => {
    if (onUpdateSlots) {
      onUpdateSlots(updatedSlots);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header & Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>
              {isTa
                ? 'ஆசிரியர்களின் ஓய்வு வேளை அட்டவணை & மாற்றங்கள்'
                : "TEACHERS' FREE PERIOD SCHEDULE & EDIT MANAGER"}
            </span>
            <span className="text-xs font-normal text-slate-500 bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-full font-mono">
              {isTa ? '8 பாடவேளை அமைப்பு' : '8-Period Model'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTa
              ? 'ஓய்வு வேளைகளில் மாற்றங்கள் செய்ய "திருத்து (Edit)" பொத்தானை அழுத்தவும் அல்லது எந்தவொரு கட்டத்தையும் கிளிக் செய்யவும்.'
              : 'Click the "Edit" button on any teacher row or cell to adjust free periods, swap slots, or assign classes.'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'ஓய்வு வேளை அட்டவணை' : 'Free Period Schedule'}
            </button>
            <button
              onClick={() => setActiveTab('proxy')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'proxy'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'தினசரி பதிலீடு மேலாளர்' : 'Daily Proxy Arranger'}
            </button>
          </div>

          {activeTab === 'schedule' && (
            <>
              {/* Prominent Edit Free Periods Action Button */}
              <button
                type="button"
                onClick={() => handleOpenEdit(filteredTeachers[0] || teachers[0], 'Monday')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-all shadow-xs ring-1 ring-blue-500/50"
                title="Edit teacher free periods, assignments and schedules"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>{isTa ? 'மாற்றங்களைச் செய் (Edit)' : 'Edit Free Periods'}</span>
              </button>

              {/* Quick Inline Edit Mode Switch */}
              <button
                type="button"
                onClick={() => setQuickEditMode(!quickEditMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  quickEditMode
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-300'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                title="Toggle visual edit badges on table cells"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>
                  {quickEditMode
                    ? isTa
                      ? 'விரைவு தொகுத்தல்: ஆன்'
                      : 'Quick Edit: ON'
                    : isTa
                    ? 'விரைவு தொகுத்தல் முறை'
                    : 'Quick Edit Mode'}
                </span>
              </button>
            </>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isTa ? 'அச்சிடுக' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TEACHERS' FREE PERIOD SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
          {/* Official Banner Matching PDF Header */}
          <div className="bg-[#1e3a8a] text-white py-3 px-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold tracking-wider uppercase text-sm font-sans flex items-center gap-2">
                  <span>{isTa ? 'ஆசிரியர்களின் ஓய்வு வேளை விவரங்கள்' : "TEACHERS' FREE PERIOD SCHEDULE"}</span>
                </h3>
                <p className="text-[11px] text-blue-200">
                  {isTa ? config.schoolNameTamil || config.schoolName : config.schoolName} · 30 {isTa ? 'ஆசிரியர்கள்' : 'Faculty'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-blue-950/70 border border-blue-700/60 px-3 py-1 rounded-lg text-xs font-mono text-blue-200 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {isTa ? 'மொத்த வாராந்திர ஓய்வு:' : 'Total Free Periods:'}{' '}
                  <strong className="text-emerald-300 font-bold">{totalFreePeriodsAllTeachers}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Filters Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={isTa ? 'ஆசிரியர் பெயர் / குறியீடு...' : 'Search teacher code or name...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={departmentFilter}
                  onChange={e => setDepartmentFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="all">{isTa ? 'அனைத்துத் துறைகளும்' : 'All Departments'}</option>
                  {departments.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-600 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
              <span>
                {isTa
                  ? 'மாற்றங்களைச் செய்ய ஒவ்வொரு வரிசையிலும் உள்ள "திருத்து (Edit)" பொத்தானைப் பயன்படுத்தவும்.'
                  : 'Click "Edit" on any row to open the complete change dialog.'}
              </span>
            </div>
          </div>

          {/* Timetable Matrix */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#1e40af] text-white divide-x divide-blue-500">
                  <th className="py-2.5 px-4 text-left font-bold uppercase tracking-wider w-64">
                    {isTa ? 'ஆசிரியர் பெயர்' : "Teacher's Name"}
                  </th>
                  {config.days.map(d => (
                    <th
                      key={d}
                      className="py-2.5 px-3 text-center font-bold uppercase tracking-wider min-w-[120px]"
                    >
                      {isTa ? dayNamesTamil[d] : d}
                    </th>
                  ))}
                  <th className="py-2.5 px-4 text-center font-bold uppercase tracking-wider w-32 no-print bg-[#172554]">
                    {isTa ? 'மாற்றங்கள் (Edit)' : 'Actions / Edit'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {filteredTeachers.map(teacher => {
                  const freeData = freePeriodMap[teacher.id];
                  const teacherDisplayName = isTa && teacher.nameTamil ? teacher.nameTamil : teacher.name;

                  return (
                    <tr
                      key={teacher.id}
                      className="divide-x divide-slate-200 hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* Teacher's Name column */}
                      <td className="py-2.5 px-4 font-semibold text-slate-900 bg-slate-50/60 whitespace-nowrap">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-xs border border-blue-200">
                              {teacher.code}
                            </span>
                            <span className="truncate max-w-[180px] font-bold text-slate-800">
                              {teacherDisplayName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-normal">
                            ({teacher.department})
                          </span>
                        </div>
                      </td>

                      {/* Day Columns (Mon-Fri) showing free period numbers */}
                      {config.days.map(d => {
                        const freeList = freeData ? freeData[d] || [] : [];
                        const freeStr = freeList.length > 0 ? freeList.join(', ') : (isTa ? 'இல்லை' : 'None');

                        return (
                          <td
                            key={d}
                            onClick={() => handleOpenEdit(teacher, d)}
                            className={`py-2 px-3 text-center font-mono font-medium text-xs cursor-pointer select-none transition-all relative ${
                              freeList.length === 0
                                ? 'text-slate-400 bg-slate-50/40 hover:bg-blue-100/60'
                                : 'text-blue-950 font-semibold hover:bg-blue-100/70 hover:shadow-inner'
                            }`}
                            title={`Click to edit ${teacher.code} schedule on ${d}`}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="hover:underline">{freeStr}</span>
                              {quickEditMode && (
                                <Pencil className="w-2.5 h-2.5 text-blue-500 opacity-60" />
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Dedicated High-Visibility Edit Button Column */}
                      <td className="py-2 px-3 text-center no-print bg-slate-50/80">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(teacher, 'Monday')}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900 transition-all shadow-xs border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                          title={`Edit ${teacher.code} Free Periods & Timetable Schedule`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>{isTa ? 'திருத்து' : 'Edit'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE PROXY & SUBSTITUTION ARRANGER */}
      {activeTab === 'proxy' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 no-print">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <CalendarDays className="w-5 h-5 text-blue-700" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {isTa ? 'தினசரி மாற்று ஆசிரியர் (பதிலீடு) மேலாளர்' : 'Daily Substitution & Proxy Assignment Manager'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isTa
                    ? 'விடுப்பில் உள்ள ஆசிரியரைத் தேர்வுசெய்து அவர்களது பாடவேளைகளுக்கு ஓய்வு ஆசிரியரை நியமிக்கவும்.'
                    : 'Select teacher absent today to inspect scheduled periods and assign available free staff.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isTa ? 'விடுப்பில் உள்ள ஆசிரியர்' : 'Absent Teacher'}
                </label>
                <select
                  value={absentTeacherId}
                  onChange={e => setAbsentTeacherId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.code} - {isTa && t.nameTamil ? t.nameTamil : t.name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isTa ? 'கிழமை' : 'Working Day'}
                </label>
                <select
                  value={selectedDay}
                  onChange={e => setSelectedDay(e.target.value as DayOfWeek)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {config.days.map(d => (
                    <option key={d} value={d}>
                      {isTa ? dayNamesTamil[d] : d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isTa ? 'தேதி' : 'Date'}
                </label>
                <input
                  type="date"
                  value={proxyDate}
                  onChange={e => setProxyDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Affected Classes Table & Candidate Suggestions */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-[#1e3a8a] text-white py-2.5 px-4 flex items-center justify-between">
              <div className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                <UserMinus className="w-4 h-4 text-rose-300" />
                <span>
                  {absentTeacher?.code} ({isTa && absentTeacher?.nameTamil ? absentTeacher.nameTamil : absentTeacher?.name}) - {isTa ? `${dayNamesTamil[selectedDay]} வேளைகள்` : `${selectedDay} Scheduled Periods`}
                </span>
              </div>
              <div className="text-xs bg-rose-600 px-2 py-0.5 rounded font-mono font-bold text-white">
                {affectedSlots.length} {isTa ? 'பாதிக்கப்பட்ட வேளைகள்' : 'Affected Periods'}
              </div>
            </div>

            {affectedSlots.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                {absentTeacher?.code} {isTa ? `${dayNamesTamil[selectedDay]} அன்று எந்த பாடவேளையும் இல்லை.` : `has no scheduled teaching periods on ${selectedDay}.`}
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {affectedSlots.map(slot => {
                  const cls = classMap.get(slot.classId);
                  const sub = subjectMap.get(slot.subjectId);
                  const timing = config.periodTimings.find(t => t.period === slot.period);

                  const existingSub = substitutions.find(
                    s =>
                      s.classId === slot.classId &&
                      s.day === slot.day &&
                      s.period === slot.period &&
                      s.date === proxyDate
                  );

                  // Find candidate teachers free at this day & period
                  const candidates = teachers
                    .filter(t => {
                      if (t.id === absentTeacherId) return false;
                      const isOccupied = slots.some(
                        s => s.teacherId === t.id && s.day === selectedDay && s.period === slot.period
                      );
                      return !isOccupied;
                    })
                    .sort((a, b) => {
                      const aSameDept = a.department === absentTeacher?.department ? 1 : 0;
                      const bSameDept = b.department === absentTeacher?.department ? 1 : 0;
                      return bSameDept - aSameDept;
                    });

                  return (
                    <div key={slot.id} className="p-4 space-y-3 hover:bg-slate-50/70 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-blue-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                            P{slot.period}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{isTa && cls?.nameTamil ? cls.nameTamil : cls?.name}</span>
                              <span className="text-xs font-normal text-slate-500">· {cls?.roomNumber}</span>
                            </div>
                            <div className="text-xs text-slate-600 flex items-center gap-2">
                              <span className="font-medium text-blue-800">
                                {isTa && sub?.tamilName ? sub.tamilName : sub?.name}
                              </span>
                              {timing && (
                                <span className="text-slate-400">
                                  ({timing.startTime} - {timing.endTime})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status */}
                        {existingSub ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center gap-1.5 border border-emerald-300">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              {isTa ? 'பதிலீடு நியமிக்கப்பட்டது:' : 'Proxy Assigned:'} {teacherMap.get(existingSub.substituteTeacherId)?.code} (
                              {isTa && teacherMap.get(existingSub.substituteTeacherId)?.nameTamil ? teacherMap.get(existingSub.substituteTeacherId)?.nameTamil : teacherMap.get(existingSub.substituteTeacherId)?.name})
                            </span>
                            <button
                              onClick={() => onRemoveSubstitution(existingSub.id)}
                              className="text-xs text-rose-600 hover:text-rose-800 underline ml-1"
                            >
                              {isTa ? 'ரத்துசெய்' : 'Cancel'}
                            </button>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-300">
                            {isTa ? 'நியமிக்கப்படவில்லை' : 'Unassigned'}
                          </span>
                        )}
                      </div>

                      {/* Candidate Free Teachers Selector */}
                      {!existingSub && (
                        <div className="pl-11 flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-slate-500 font-medium">
                            {isTa ? 'ஓய்வில் உள்ள ஆசிரியர்கள்' : 'Available Free Teachers'} ({candidates.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {candidates.slice(0, 6).map(cand => {
                              const isSameDept = cand.department === absentTeacher?.department;
                              const candName = isTa && cand.nameTamil ? cand.nameTamil : cand.name;
                              return (
                                <button
                                  key={cand.id}
                                  onClick={() =>
                                    onAddSubstitution({
                                      id: `sub-${Date.now()}-${slot.id}`,
                                      date: proxyDate,
                                      day: selectedDay,
                                      period: slot.period,
                                      classId: slot.classId,
                                      subjectId: slot.subjectId,
                                      originalTeacherId: absentTeacherId,
                                      substituteTeacherId: cand.id,
                                      reason: 'Medical / Casual Leave',
                                      status: 'assigned',
                                    })
                                  }
                                  className={`px-2 py-1 rounded text-xs font-medium border transition-colors flex items-center gap-1 ${
                                    isSameDept
                                      ? 'bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                  title={`Assign ${candName} (${cand.department})`}
                                >
                                  <Plus className="w-3 h-3 text-slate-400" />
                                  <span className="font-mono font-bold">{cand.code}</span>
                                  <span>{candName}</span>
                                  {isSameDept && (
                                    <span className="text-[10px] text-blue-600 font-semibold ml-0.5">
                                      [{isTa ? 'துறை பொருத்தம்' : 'Dept Match'}]
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Substitutions List & Printable Proxy Slip */}
          {substitutions.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  {isTa ? 'அதிகாரப்பூர்வ பதிலீடு ஆணைச் சீட்டு (அச்சிடத் தயார்)' : 'Official Substitution Notice Slip (Ready to Print)'}
                </h4>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isTa ? 'பதிலீடு ஆணை அச்சிடுக' : 'Print Proxy Orders'}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 divide-x divide-slate-200 border-b border-slate-300">
                      <th className="py-2 px-3 text-left font-bold">{isTa ? 'தேதி & கிழமை' : 'Date & Day'}</th>
                      <th className="py-2 px-3 text-center font-bold">{isTa ? 'பாடவேளை' : 'Period'}</th>
                      <th className="py-2 px-3 text-left font-bold">{isTa ? 'வகுப்பு & அறை' : 'Class & Room'}</th>
                      <th className="py-2 px-3 text-left font-bold">{isTa ? 'பாடம்' : 'Subject'}</th>
                      <th className="py-2 px-3 text-left font-bold">{isTa ? 'விடுப்பில் உள்ள ஆசிரியர்' : 'Absent Teacher'}</th>
                      <th className="py-2 px-3 text-left font-bold bg-blue-50 text-blue-900">
                        {isTa ? 'நியமிக்கப்பட்ட மாற்று ஆசிரியர்' : 'Assigned Proxy Teacher'}
                      </th>
                      <th className="py-2 px-3 text-center font-bold no-print">{isTa ? 'செயல்' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-sans">
                    {substitutions.map(sub => {
                      const cls = classMap.get(sub.classId);
                      const subject = subjectMap.get(sub.subjectId);
                      const origTeacher = teacherMap.get(sub.originalTeacherId);
                      const proxyTeacher = teacherMap.get(sub.substituteTeacherId);

                      return (
                        <tr key={sub.id} className="divide-x divide-slate-200 hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-800">
                            {sub.date} ({isTa ? dayNamesTamil[sub.day] : sub.day})
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                            {isTa ? `வேளை ${sub.period}` : `Period ${sub.period}`}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            {isTa && cls?.nameTamil ? cls.nameTamil : cls?.name} ({cls?.roomNumber})
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-800">
                            {isTa && subject?.tamilName ? subject.tamilName : subject?.name}
                          </td>
                          <td className="py-2 px-3 font-medium text-rose-700">
                            {origTeacher?.code} - {isTa && origTeacher?.nameTamil ? origTeacher.nameTamil : origTeacher?.name}
                          </td>
                          <td className="py-2 px-3 font-bold text-emerald-800 bg-emerald-50/50">
                            {proxyTeacher?.code} - {isTa && proxyTeacher?.nameTamil ? proxyTeacher.nameTamil : proxyTeacher?.name}
                          </td>
                          <td className="py-2 px-3 text-center no-print">
                            <button
                              onClick={() => onRemoveSubstitution(sub.id)}
                              className="text-xs text-rose-600 hover:text-rose-800"
                            >
                              {isTa ? 'நீக்கு' : 'Remove'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Principal Signature Strip */}
              <div className="pt-6 flex justify-between items-end text-xs text-slate-700 font-medium">
                <div>
                  <p>{isTa ? 'தயாரித்தவர்: கால அட்டவணை பொறுப்பாசிரியர்' : 'Prepared By: Academic Timetable In-charge'}</p>
                </div>
                <div className="text-right">
                  <p className="border-t border-slate-400 pt-1 w-44">
                    {isTa ? 'தலைமை ஆசிரியர் / முதல்வர்' : 'Headmaster / Principal'}
                  </p>
                  <p className="text-[10px] text-slate-400">{isTa ? config.schoolNameTamil || config.schoolName : config.schoolName}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Teacher Free Periods Modal */}
      {editingTeacher && (
        <EditTeacherFreePeriodsModal
          isOpen={Boolean(editingTeacher)}
          onClose={() => setEditingTeacher(null)}
          teacher={editingTeacher}
          teachers={teachers}
          initialDay={editingDay}
          config={config}
          slots={slots}
          classes={classes}
          subjects={subjects}
          languageMode={languageMode}
          onUpdateSlots={handleSlotsUpdated}
          onUpdateTeacher={onUpdateTeacher}
        />
      )}
    </div>
  );
};
