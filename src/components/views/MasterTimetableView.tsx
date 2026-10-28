import React, { useState, useMemo } from 'react';
import {
  TimetableSlot,
  ClassSection,
  Teacher,
  Subject,
  DayOfWeek,
  SchoolConfig,
  TimetableClash,
  AcademicStage,
  SubjectPeriodRequirement,
} from '../../types/timetable';
import {
  Filter,
  Search,
  AlertCircle,
  Plus,
  Layers,
  CalendarCheck,
  Clock,
  Percent,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Users,
  BookOpen,
  Flame,
  Activity,
  Zap,
  BarChart3,
} from 'lucide-react';
import { LanguageMode } from '../Header';
import { DayWiseAnalysisPanel } from './DayWiseAnalysisPanel';
import { DailyValidationPanel } from './DailyValidationPanel';

interface MasterTimetableViewProps {
  config: SchoolConfig;
  slots: TimetableSlot[];
  classes: ClassSection[];
  teachers: Teacher[];
  subjects: Subject[];
  clashes: TimetableClash[];
  languageMode: LanguageMode;
  onSelectSlot: (classId: string, day: DayOfWeek, period: number) => void;
  requirements?: SubjectPeriodRequirement[];
  onNavigateToClass?: (classId: string) => void;
}

export const MasterTimetableView: React.FC<MasterTimetableViewProps> = ({
  config,
  slots,
  classes,
  teachers,
  subjects,
  clashes,
  languageMode,
  onSelectSlot,
  requirements = [],
  onNavigateToClass,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showDayAnalysis, setShowDayAnalysis] = useState<boolean>(false);
  const [showDailyValidation, setShowDailyValidation] = useState<boolean>(false);
  const [hoveredPeriodForHeatmap, setHoveredPeriodForHeatmap] = useState<{ day: DayOfWeek; period: number } | null>(null);
  const [pinnedHeatmapPeriod, setPinnedHeatmapPeriod] = useState<{ day: DayOfWeek; period: number } | null>(null);

  const isTa = languageMode === 'ta';
  const isBi = languageMode === 'bilingual';

  const teacherMap = new Map<string, Teacher>(teachers.map(t => [t.id, t]));
  const subjectMap = new Map<string, Subject>(subjects.map(s => [s.id, s]));
  const classMap = new Map<string, ClassSection>(classes.map(c => [c.id, c]));

  // Determine clash lookup: key: `${day}_${period}_${classId}`
  const clashSlotSet = new Set<string>();
  clashes.forEach(c => {
    c.affectedClassIds.forEach(clsId => {
      clashSlotSet.add(`${c.day}_${c.period}_${clsId}`);
    });
  });

  const daysToRender = selectedDay === 'all' ? config.days : [selectedDay as DayOfWeek];

  // Filter classes by stage if selected
  const classesToRender = classes.filter(cls => {
    if (selectedStage === 'all') return true;
    return cls.stage === (selectedStage as AcademicStage);
  });

  const maxPeriods = config.defaultPeriodsPerDay || 8;

  // Comprehensive Timetable Coverage & Summary Calculations
  const totalSchoolSlots = classes.length * config.days.length * maxPeriods;
  const totalAssignedSlots = slots.filter(s => Boolean(s.subjectId && s.subjectId.trim() !== '')).length;
  const totalUnassignedSlots = Math.max(0, totalSchoolSlots - totalAssignedSlots);
  const coveragePercentage = totalSchoolSlots > 0 ? Math.min(100, Math.round((totalAssignedSlots / totalSchoolSlots) * 100)) : 0;

  // Active scheduled staff
  const activeTeacherIds = new Set(slots.filter(s => Boolean(s.teacherId)).map(s => s.teacherId));
  const activeTeachersCount = activeTeacherIds.size;

  // Filtered view statistics (when filtering by stage or day)
  const isFiltered = selectedStage !== 'all' || selectedDay !== 'all';
  const filteredPossible = classesToRender.length * daysToRender.length * maxPeriods;
  const filteredAssigned = slots.filter(
    s => classesToRender.some(c => c.id === s.classId) && daysToRender.includes(s.day) && Boolean(s.subjectId)
  ).length;
  const filteredUnassigned = Math.max(0, filteredPossible - filteredAssigned);
  const filteredCoverage = filteredPossible > 0 ? Math.min(100, Math.round((filteredAssigned / filteredPossible) * 100)) : 0;

  const dayNamesTamil: Record<DayOfWeek, string> = {
    Monday: 'திங்கள்',
    Tuesday: 'செவ்வாய்',
    Wednesday: 'புதன்',
    Thursday: 'வியாழன்',
    Friday: 'வெள்ளி',
    Saturday: 'சனி',
  };

  // Comprehensive Visual Heatmap: Teacher Unavailability & Free vs Busy Lookup
  const heatmapLookup = useMemo(() => {
    const map = new Map<
      string,
      {
        occupiedCount: number;
        freeCount: number;
        unavailabilityRate: number;
        freeRate: number;
        clashesCount: number;
        clashesList: TimetableClash[];
        intensity: 'low' | 'moderate' | 'high' | 'critical';
        cellBg: string;
        badgeColor: string;
        rowBg: string;
        description: string;
        freeTeachers: Teacher[];
        occupiedTeachersList: {
          slot: TimetableSlot;
          teacher?: Teacher;
          subject?: Subject;
          classSection?: ClassSection;
        }[];
        departmentFreeList: Record<string, Teacher[]>;
      }
    >();

    config.days.forEach(day => {
      for (let p = 1; p <= maxPeriods; p++) {
        const key = `${day}_${p}`;
        // Find occupied teacher ids in this time slot
        const slotsInPeriod = slots.filter(s => s.day === day && s.period === p && s.teacherId);
        const occupiedTeachers = new Set(slotsInPeriod.map(s => s.teacherId));
        const occupiedCount = occupiedTeachers.size;
        const totalTeachers = teachers.length || 30;
        const freeTeachers = teachers.filter(t => !occupiedTeachers.has(t.id));
        const freeCount = freeTeachers.length;
        const unavailabilityRate = Math.round((occupiedCount / totalTeachers) * 100);
        const freeRate = Math.round((freeCount / totalTeachers) * 100);
        const clashesInPeriod = clashes.filter(c => c.day === day && c.period === p);
        const clashesCount = clashesInPeriod.length;

        const occupiedTeachersList = slotsInPeriod.map(s => ({
          slot: s,
          teacher: teacherMap.get(s.teacherId),
          subject: subjectMap.get(s.subjectId),
          classSection: classMap.get(s.classId),
        }));

        const departmentFreeList: Record<string, Teacher[]> = {};
        freeTeachers.forEach(t => {
          const dept = t.department || 'General';
          if (!departmentFreeList[dept]) departmentFreeList[dept] = [];
          departmentFreeList[dept].push(t);
        });

        let intensity: 'low' | 'moderate' | 'high' | 'critical' = 'low';
        let cellBg = 'bg-emerald-50/60 border-emerald-200 text-emerald-900';
        let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        let rowBg = '';
        let description = 'Low Unavailability · Ample Substitute Teachers';

        if (clashesCount > 0 || unavailabilityRate >= 70) {
          intensity = 'critical';
          cellBg = 'bg-rose-100/90 border-rose-400 text-rose-950 font-semibold';
          badgeColor = 'bg-rose-600 text-white border-rose-700 animate-pulse';
          rowBg = 'bg-rose-50/40';
          description = clashesCount > 0
            ? `${clashesCount} Conflicting Requirements Flagged!`
            : 'Critical Teacher Unavailability (>70% Occupied)';
        } else if (unavailabilityRate >= 50) {
          intensity = 'high';
          cellBg = 'bg-amber-100/80 border-amber-300 text-amber-950 font-medium';
          badgeColor = 'bg-amber-500 text-white border-amber-600';
          rowBg = 'bg-amber-50/30';
          description = 'High Teacher Unavailability (50%-69% Occupied)';
        } else if (unavailabilityRate >= 35) {
          intensity = 'moderate';
          cellBg = 'bg-yellow-50 border-yellow-300 text-yellow-950';
          badgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-300';
          rowBg = 'bg-yellow-50/20';
          description = 'Moderate Load · Balanced Availability';
        }

        map.set(key, {
          occupiedCount,
          freeCount,
          unavailabilityRate,
          freeRate,
          clashesCount,
          clashesList: clashesInPeriod,
          intensity,
          cellBg,
          badgeColor,
          rowBg,
          description,
          freeTeachers,
          occupiedTeachersList,
          departmentFreeList,
        });
      }
    });

    return map;
  }, [config.days, maxPeriods, slots, teachers, clashes, teacherMap, subjectMap, classMap]);

  return (
    <div className="space-y-4">
      {/* Top Statistical Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 no-print">
        {/* Card 1: Total Periods Assigned */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/60 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {isTa ? 'ஒதுக்கப்பட்ட பாடவேளைகள்' : 'Periods Assigned'}
              </p>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {totalAssignedSlots}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  / {totalSchoolSlots}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-600">
              {isFiltered ? (
                <span>
                  {isTa ? 'தேர்வில்:' : 'Filtered:'}{' '}
                  <strong className="text-blue-700 font-semibold">{filteredAssigned}</strong> / {filteredPossible}
                </span>
              ) : (
                <span>{classes.length} {isTa ? 'வகுப்புகள் (1-12)' : 'Classes & Sections'}</span>
              )}
            </span>
            <span className="text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
              {maxPeriods * config.days.length} {isTa ? 'வேளைகள்/வாரம்' : 'p/wk'}
            </span>
          </div>
        </div>

        {/* Card 2: Unassigned Slots */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/60 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {isTa ? 'ஒதுக்கப்படாத இடங்கள்' : 'Unassigned Slots'}
              </p>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${
                    totalUnassignedSlots === 0 ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {totalUnassignedSlots}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {totalUnassignedSlots === 0 ? (isTa ? 'பூர்த்தி' : 'Filled') : (isTa ? 'மீதம்' : 'Pending')}
                </span>
              </div>
            </div>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                totalUnassignedSlots === 0
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-amber-50 text-amber-600 border border-amber-100'
              }`}
            >
              {totalUnassignedSlots === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <Clock className="w-5 h-5 text-amber-600" />
              )}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-600">
              {totalUnassignedSlots === 0 ? (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isTa ? 'அனைத்து இடங்களும் பூர்த்தி' : '100% Fully Allocated'}
                </span>
              ) : (
                <span className="text-amber-700 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {isTa ? 'ஒதுக்கீடு தேவை' : 'Needs slot allotment'}
                </span>
              )}
            </span>
            {isFiltered && (
              <span className="text-slate-500 text-[10px]">
                {filteredUnassigned} {isTa ? 'தேர்வில்' : 'in view'}
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Teacher-Subject Coverage Percentage */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/60 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {isTa ? 'பாட-ஆசிரியர் உள்ளடக்கம்' : 'Subject Coverage'}
              </p>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-indigo-900 tracking-tight font-mono">
                  {coveragePercentage}%
                </span>
                <span className="text-xs text-indigo-600 font-medium">
                  {coveragePercentage >= 95 ? (isTa ? 'நிறைவு' : 'Optimal') : (isTa ? 'செயலில்' : 'In Progress')}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          {/* Visual Progress Bar */}
          <div className="mt-2.5">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  coveragePercentage >= 95
                    ? 'bg-gradient-to-r from-blue-600 to-emerald-500'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                }`}
                style={{ width: `${coveragePercentage}%` }}
              />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>
              {activeTeachersCount} / {teachers.length} {isTa ? 'ஆசிரியர்கள் பணியில்' : 'Faculty active'}
            </span>
            <span className="text-indigo-700 font-semibold text-[10px]">
              {subjects.length} {isTa ? 'பாடங்கள்' : 'Subjects'}
            </span>
          </div>
        </div>

        {/* Card 4: Schedule Integrity & Verification */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between relative overflow-hidden group">
          <div
            className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform ${
              clashes.length === 0 ? 'bg-emerald-50/60' : 'bg-rose-50/60'
            }`}
          />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {isTa ? 'அட்டவணை முரண்பாடுகள்' : 'Schedule Integrity'}
              </p>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${
                    clashes.length === 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {clashes.length}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {clashes.length === 0
                    ? isTa
                      ? 'முரண்பாடற்றது'
                      : '0 Clashes'
                    : isTa
                    ? 'முரண்பாடுகள்'
                    : 'Conflicts'}
                </span>
              </div>
            </div>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                clashes.length === 0
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse'
              }`}
            >
              <ShieldCheck
                className={`w-5 h-5 ${clashes.length === 0 ? 'text-emerald-600' : 'text-rose-600'}`}
              />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span
              className={`font-semibold flex items-center gap-1 ${
                clashes.length === 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {clashes.length === 0 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isTa ? 'அனைத்து ஆசிரியர்களும் சரிபார்க்கப்பட்டனர்' : 'Zero Teacher Overlaps'}
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  {clashes.length} {isTa ? 'இடங்களில் முரண்பாடு' : 'Double bookings detected'}
                </>
              )}
            </span>
            <span className="text-slate-400 text-[10px]">Govt Order 2026</span>
          </div>
        </div>
      </div>

      {/* View Header & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>
              {isTa
                ? 'முழு பள்ளி கால அட்டவணை (வகுப்பு 1 முதல் 12 வரை)'
                : 'ALL CLASS MASTER TIME TABLE (Classes 1 to 12)'}
            </span>
            <span className="text-xs font-normal text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {isTa ? 'திருத்திய அட்டவணை 2026-2027 (40 பாடவேளைகள்)' : 'Govt Order 2026-2027 (40 Periods)'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTa
              ? 'தினமும் 1 பிரிவேளை விளையாட்டு/கலை இணைச் செயல்பாடுகளுடன் அனைத்து வகுப்புகளுக்கான ஒருங்கிணைந்த அட்டவணை.'
              : 'Institutional master matrix across Classes 1 to 12 with daily Sports, Arts & Co-Curricular allotment.'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Stage Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <Layers className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <button
              onClick={() => setSelectedStage('all')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedStage === 'all'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'அனைத்து (1-12)' : 'All (1-12)'}
            </button>
            <button
              onClick={() => setSelectedStage('primary')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedStage === 'primary'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'தொடக்க (1-5)' : 'Primary (1-5)'}
            </button>
            <button
              onClick={() => setSelectedStage('middle')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedStage === 'middle'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'நடுநிலை (6-8)' : 'Middle (6-8)'}
            </button>
            <button
              onClick={() => setSelectedStage('high')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedStage === 'high'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'உயர்நிலை (9-10)' : 'High (9-10)'}
            </button>
            <button
              onClick={() => setSelectedStage('higher-secondary')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedStage === 'higher-secondary'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'மேல்நிலை (11-12)' : 'Hr Sec (11-12)'}
            </button>
          </div>

          {/* Day Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedDay === 'all'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'அனைத்து நாட்கள்' : 'All Days'}
            </button>
            {config.days.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedDay === d
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isTa ? dayNamesTamil[d] : d.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Daily Validation Toggle */}
          <button
            onClick={() => setShowDailyValidation(!showDailyValidation)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              showDailyValidation
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Toggle Daily & Subject Allotment Validation Panel"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${showDailyValidation ? 'text-amber-200' : 'text-amber-600'}`} />
            <span>{isTa ? 'ஒதுக்கீட்டு சரிபார்ப்பு' : 'Daily Validation'}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                showDailyValidation ? 'bg-amber-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {showDailyValidation ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Day-Wise Analysis Toggle */}
          <button
            onClick={() => setShowDayAnalysis(!showDayAnalysis)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              showDayAnalysis
                ? 'bg-blue-900 hover:bg-blue-800 text-white border-blue-950 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Toggle Day-Wise Practical & Bottleneck Analysis"
          >
            <BarChart3 className={`w-3.5 h-3.5 ${showDayAnalysis ? 'text-blue-300' : 'text-blue-700'}`} />
            <span>{isTa ? 'நாள் பகுப்பாய்வு' : 'Day-Wise Analysis'}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                showDayAnalysis ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {showDayAnalysis ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Heatmap Overlay Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              showHeatmap
                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Toggle Teacher Unavailability & Conflict Heatmap"
          >
            <Flame className={`w-3.5 h-3.5 ${showHeatmap ? 'text-white' : 'text-amber-500'}`} />
            <span>{isTa ? 'வெப்ப வரைபடம்' : 'Heatmap'}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                showHeatmap ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {showHeatmap ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isTa ? 'தேடுக (ஆசிரியர் / பாடம்)...' : 'Search teacher / subject...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white w-40"
            />
          </div>
        </div>
      </div>

      {/* DAILY VALIDATION PANEL COMPONENT */}
      {showDailyValidation && (
        <DailyValidationPanel
          config={config}
          classes={classes}
          teachers={teachers}
          subjects={subjects}
          requirements={requirements}
          slots={slots}
          languageMode={languageMode}
          onClose={() => setShowDailyValidation(false)}
          onNavigateToClass={onNavigateToClass}
          onSelectSlot={onSelectSlot}
        />
      )}

      {/* DAY-WISE ANALYSIS PANEL (SUBJECT & PRACTICAL DISTRIBUTION + BOTTLENECK DIAGNOSTICS) */}
      {showDayAnalysis && (
        <DayWiseAnalysisPanel
          config={config}
          slots={slots}
          classes={classes}
          teachers={teachers}
          subjects={subjects}
          clashes={clashes}
          languageMode={languageMode}
          initialSelectedDay={selectedDay}
          onClose={() => setShowDayAnalysis(false)}
        />
      )}

      {/* VISUAL HEATMAP OVERVIEW MATRIX PANEL */}
      {showHeatmap && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-4 no-print space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Flame className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>
                    {isTa
                      ? 'ஆசிரியர் பற்றாக்குறை & தேவை வெப்ப வரைபடம் (5 நாட்கள் × 8 பாடவேளைகள்)'
                      : 'TEACHER UNAVAILABILITY & CONFLICT INTENSITY HEATMAP (5 DAYS × 8 PERIODS)'}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Live Heat Intensity
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isTa
                    ? 'ஆசிரியர்கள் அதிகளவில் வகுப்பில் இருக்கும் வேளைகளையும், முரண்பாடுகள் உள்ள வேளைகளையும் வண்ண அடர்த்தி மூலம் காட்டுகிறது.'
                    : 'Highlights time slots with high teacher unavailability or conflicting period requirements using color intensity.'}
                </p>
              </div>
            </div>

            {/* Color Intensity Scale Legend */}
            <div className="flex items-center flex-wrap gap-2 text-[10px] font-medium text-slate-600">
              <span className="text-slate-400 uppercase tracking-wider font-semibold mr-1">
                {isTa ? 'அடர்த்தி:' : 'Intensity:'}
              </span>
              <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{isTa ? 'குறைவு (<35%)' : 'Low (<35%)'}</span>
              </span>
              <span className="flex items-center gap-1 bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span>{isTa ? 'மிதமான (35-49%)' : 'Moderate (35-49%)'}</span>
              </span>
              <span className="flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                <span>{isTa ? 'அதிக சுமை (50-69%)' : 'High (50-69%)'}</span>
              </span>
              <span className="flex items-center gap-1 bg-rose-100 text-rose-950 px-2 py-0.5 rounded border border-rose-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                <span>{isTa ? 'முரண்பாடு / தீவிர (>70%)' : 'Critical / Conflict (≥70%)'}</span>
              </span>
            </div>
          </div>

          {/* Interactive Heatmap Matrix Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 divide-x divide-slate-200">
                  <th className="py-2 px-3 text-left font-semibold w-24">
                    {isTa ? 'நாள் / நேரம்' : 'Day / Period'}
                  </th>
                  {Array.from({ length: maxPeriods }, (_, i) => i + 1).map(p => {
                    const timing = config.periodTimings.find(t => t.period === p);
                    return (
                      <th key={p} className="py-1.5 px-2 text-center font-semibold">
                        <div className="font-mono text-xs">P-{p}</div>
                        {timing && (
                          <div className="text-[9px] font-normal text-slate-400">
                            {timing.startTime.split(' ')[0]}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {config.days.map(day => (
                  <tr key={`heatmap-${day}`} className="divide-x divide-slate-200">
                    <td className="py-2 px-3 font-bold text-slate-800 bg-slate-50 font-mono text-xs whitespace-nowrap">
                      {isTa ? dayNamesTamil[day] : day}
                    </td>
                    {Array.from({ length: maxPeriods }, (_, i) => i + 1).map(p => {
                      const key = `${day}_${p}`;
                      const info = heatmapLookup.get(key);
                      if (!info) return <td key={p} className="p-2 bg-slate-50"></td>;

                      return (
                        <td
                          key={p}
                          onClick={() => setSelectedDay(day)}
                          title={`${day} Period ${p}: ${info.description} (${info.occupiedCount}/${teachers.length} Teachers Occupied, ${info.freeCount} Free for Proxy)`}
                          className={`py-2 px-2 text-center cursor-pointer transition-all hover:scale-[1.02] border ${info.cellBg}`}
                        >
                          <div className="font-mono font-bold text-xs flex items-center justify-center gap-1">
                            {info.clashesCount > 0 ? (
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
                            ) : null}
                            <span>{info.unavailabilityRate}%</span>
                          </div>
                          <div className="text-[10px] opacity-80 mt-0.5">
                            {info.occupiedCount}/{teachers.length} {isTa ? 'ஆசிரியர்' : 'Busy'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clash notification banner if any clashes exist */}
      {clashes.length > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{isTa ? 'கண்டறியப்பட்ட அட்டவணை முரண்பாடுகள்:' : 'Schedule conflicts detected:'} ({clashes.length})</p>
            <ul className="list-disc pl-4 space-y-0.5 text-rose-700">
              {clashes.slice(0, 3).map((c, i) => (
                <li key={i}>{c.message}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Master Table Grid */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        {/* Table Title banner matching PDF navy blue banner */}
        <div className="bg-[#1e3a8a] text-white py-2.5 px-4 text-center font-bold tracking-wider text-sm uppercase">
          {isTa ? config.schoolNameTamil || config.schoolName : config.schoolName} · {isTa ? 'அனைத்து வகுப்புகளுக்கான முழு கால அட்டவணை (1 முதல் 12 வரை)' : 'ALL CLASS MASTER TIME TABLE (CLASSES 1 TO 12)'}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-[#1e3a8a] text-white divide-x divide-blue-800">
                <th
                  rowSpan={2}
                  className="py-2 px-3 text-center font-semibold uppercase tracking-wider sticky left-0 z-10 bg-[#1e3a8a] min-w-[110px] border-b border-blue-900"
                >
                  {isTa ? 'பாடவேளை / நேரம்' : 'Period / Time'}
                </th>
                {classesToRender.map(cls => (
                  <th
                    key={cls.id}
                    colSpan={2}
                    className="py-1.5 px-2 text-center font-semibold uppercase tracking-wider border-b border-blue-900 whitespace-nowrap"
                  >
                    <div>{isTa ? cls.nameTamil || cls.name : isBi ? `${cls.name} (${cls.nameTamil || ''})` : cls.name}</div>
                    <div className="text-[10px] font-normal text-blue-200 lowercase">{cls.roomNumber}</div>
                  </th>
                ))}
              </tr>
              <tr className="bg-[#2563eb] text-white divide-x divide-blue-500 border-b border-blue-800">
                {classesToRender.map(cls => (
                  <React.Fragment key={`${cls.id}-subheaders`}>
                    <th className="py-1 px-1.5 text-center font-medium text-[11px] min-w-[50px]">
                      {isTa ? 'ஆசிரியர்' : 'Teacher'}
                    </th>
                    <th className="py-1 px-1.5 text-center font-medium text-[11px] min-w-[70px]">
                      {isTa ? 'பாடம்' : 'Subject'}
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {daysToRender.map(day => {
                const rowsForDay = [];
                for (let p = 1; p <= maxPeriods; p++) {
                  const dayPeriodLabel = `${isTa ? dayNamesTamil[day] : day.slice(0, 3)}-${p}`;
                  const timing = config.periodTimings.find(t => t.period === p);
                  const heatInfo = heatmapLookup.get(`${day}_${p}`);

                  rowsForDay.push(
                    <tr
                      key={`${day}-${p}`}
                      className={`transition-colors divide-x divide-slate-200 font-sans ${
                        showHeatmap && heatInfo?.rowBg ? heatInfo.rowBg : 'hover:bg-blue-50/50'
                      }`}
                    >
                      {/* Daywise Period column with Visual Free/Busy Heatmap Indicator & Interactive Tooltip Hover */}
                      <td className="py-2 px-2 text-center text-slate-800 bg-slate-50 sticky left-0 z-10 whitespace-nowrap border-r border-slate-200 relative group/periodcell">
                        <div className="font-mono text-xs font-bold">{dayPeriodLabel}</div>
                        {timing && (
                          <div className="text-[10px] text-slate-500 font-normal">
                            {timing.startTime} - {timing.endTime}
                          </div>
                        )}

                        {/* Free vs Busy Teachers Visual Heatmap Indicator */}
                        {heatInfo && (
                          <div className="mt-1 flex flex-col items-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPinnedHeatmapPeriod(
                                  pinnedHeatmapPeriod?.day === day && pinnedHeatmapPeriod?.period === p
                                    ? null
                                    : { day, period: p }
                                );
                              }}
                              onMouseEnter={() => setHoveredPeriodForHeatmap({ day, period: p })}
                              onMouseLeave={() => setHoveredPeriodForHeatmap(null)}
                              className={`px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold flex flex-col items-center gap-0.5 transition-all shadow-2xs hover:scale-105 cursor-pointer ${
                                heatInfo.clashesCount > 0
                                  ? 'bg-rose-100 text-rose-900 border-rose-400'
                                  : heatInfo.freeCount >= 18
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                                  : heatInfo.freeCount >= 10
                                  ? 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100'
                                  : 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
                              }`}
                              title={`${day} Period ${p}: ${heatInfo.freeCount} Free, ${heatInfo.occupiedCount} Busy. Click to view available faculty.`}
                            >
                              <div className="flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  heatInfo.clashesCount > 0
                                    ? 'bg-rose-600 animate-pulse'
                                    : heatInfo.freeCount >= 18
                                    ? 'bg-emerald-600'
                                    : 'bg-amber-600'
                                }`} />
                                <span className="text-emerald-700 font-extrabold">{heatInfo.freeCount} {isTa ? 'ஓய்வு' : 'Free'}</span>
                                <span className="text-slate-300">·</span>
                                <span className="text-slate-500 font-normal">{heatInfo.occupiedCount} {isTa ? 'பணி' : 'Busy'}</span>
                              </div>
                              {/* Mini Proportional Heat Bar */}
                              <div className="w-14 bg-slate-200 h-1 rounded-full overflow-hidden flex">
                                <div
                                  className="bg-emerald-500 h-full"
                                  style={{ width: `${(heatInfo.freeCount / (teachers.length || 1)) * 100}%` }}
                                />
                                <div
                                  className="bg-amber-500 h-full"
                                  style={{ width: `${(heatInfo.occupiedCount / (teachers.length || 1)) * 100}%` }}
                                />
                              </div>
                            </button>
                          </div>
                        )}

                        {/* Interactive Tooltip Hover / Click-to-Pin Popover for Free vs Busy Teachers */}
                        {heatInfo && (
                          (hoveredPeriodForHeatmap?.day === day && hoveredPeriodForHeatmap?.period === p) ||
                          (pinnedHeatmapPeriod?.day === day && pinnedHeatmapPeriod?.period === p)
                        ) && (
                          <div
                            onMouseEnter={() => setHoveredPeriodForHeatmap({ day, period: p })}
                            onMouseLeave={() => setHoveredPeriodForHeatmap(null)}
                            className="absolute left-full top-0 ml-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-300 p-3.5 text-left z-50 text-slate-800 animate-in fade-in zoom-in-95 pointer-events-auto"
                            style={{ minWidth: '320px' }}
                          >
                            {/* Popover Header */}
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                              <div>
                                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                                  <span>{isTa ? dayNamesTamil[day] : day} · Period {p}</span>
                                  <span className="text-[10px] text-slate-500 font-normal">
                                    ({timing?.startTime} - {timing?.endTime})
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  {isTa ? 'ஆசிரியர் பணி/ஓய்வு வெப்ப வரைபடம் & மாற்று ஒதுக்கீடு' : 'Faculty Free vs Busy Heatmap & Adjustment Guide'}
                                </p>
                              </div>
                              {pinnedHeatmapPeriod?.day === day && pinnedHeatmapPeriod?.period === p && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPinnedHeatmapPeriod(null);
                                  }}
                                  className="text-xs px-1.5 py-0.5 rounded text-slate-400 hover:text-slate-600 border border-slate-200"
                                >
                                  ✕
                                </button>
                              )}
                            </div>

                            {/* KPI Availability Bar */}
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 mb-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-emerald-700 flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  {heatInfo.freeCount} {isTa ? 'ஓய்வு ஆசிரியர்கள்' : 'Free Teachers'} ({heatInfo.freeRate}%)
                                </span>
                                <span className="text-amber-800 flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                                  {heatInfo.occupiedCount} {isTa ? 'வகுப்பில் உள்ளோர்' : 'Busy'} ({heatInfo.unavailabilityRate}%)
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                                <div className="bg-emerald-500 h-full transition-all" style={{ width: `${heatInfo.freeRate}%` }} />
                                <div className="bg-amber-500 h-full transition-all" style={{ width: `${heatInfo.unavailabilityRate}%` }} />
                              </div>
                            </div>

                            {/* Free Teachers by Department */}
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                              <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-between mb-1">
                                  <span>{isTa ? 'ஓய்வில் உள்ள ஆசிரியர்கள் (ஒதுக்கீட்டிற்கு தயார்)' : 'Available Free Faculty'}</span>
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 rounded-full font-mono font-bold">
                                    {heatInfo.freeCount}
                                  </span>
                                </div>

                                {heatInfo.freeCount === 0 ? (
                                  <p className="text-[11px] text-slate-400 italic">
                                    {isTa ? 'அனைத்து ஆசிரியர்களும் வகுப்புகளில் உள்ளனர்.' : 'All teachers are occupied in classes.'}
                                  </p>
                                ) : (
                                  <div className="space-y-1.5">
                                    {Object.entries(heatInfo.departmentFreeList).map(([dept, teacherList]) => (
                                      <div key={dept} className="bg-emerald-50/40 border border-emerald-100 rounded p-1.5">
                                        <div className="text-[10px] font-bold text-emerald-950 flex items-center justify-between">
                                          <span>{dept}</span>
                                          <span className="text-[9px] text-emerald-700 font-mono">{teacherList.length} free</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {teacherList.map(t => (
                                            <span
                                              key={t.id}
                                              className="px-1.5 py-0.5 rounded bg-white border border-emerald-200 text-[10px] font-medium text-emerald-900 shadow-2xs flex items-center gap-1"
                                              title={`${t.name} (${t.code}) - Max Load: ${t.maxWeeklyLoad || 28}`}
                                            >
                                              <strong className="font-mono text-emerald-700 font-bold">{t.code}</strong>
                                              <span>{isTa ? t.nameTamil || t.name : t.name}</span>
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Busy Teachers Accordion */}
                              {heatInfo.occupiedTeachersList.length > 0 && (
                                <details className="text-[11px] group/busy pt-1 border-t border-slate-100">
                                  <summary className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center justify-between text-[10px] uppercase">
                                    <span>{isTa ? 'பணியில் உள்ள ஆசிரியர்கள்' : 'Busy Teachers In Session'} ({heatInfo.occupiedCount})</span>
                                    <span className="text-slate-400 group-open/busy:rotate-180 transition-transform">▼</span>
                                  </summary>
                                  <div className="mt-1.5 space-y-1 max-h-36 overflow-y-auto">
                                    {heatInfo.occupiedTeachersList.map((item, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-1 rounded bg-slate-50 border border-slate-100 text-[10px]">
                                        <div className="flex items-center gap-1 text-slate-700">
                                          <span className="font-mono font-bold text-blue-700">{item.teacher?.code || 'T-?'}</span>
                                          <span className="truncate max-w-[120px]">{isTa ? item.teacher?.nameTamil || item.teacher?.name : item.teacher?.name}</span>
                                        </div>
                                        <div className="text-slate-500 font-medium">
                                          {item.classSection?.name || 'Class'} · {item.subject?.code || 'Sub'}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              )}
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                              <span>💡 {isTa ? 'கட்டத்தில் கிளிக் செய்து ஒதுக்கீடு மாற்றவும்' : 'Click any slot in row to edit/swap'}</span>
                              <span className="font-semibold text-blue-600">{pinnedHeatmapPeriod ? (isTa ? 'நிலையானது' : 'Pinned') : (isTa ? 'ஹோவர்' : 'Hover')}</span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Class Slots */}
                      {classesToRender.map(cls => {
                        const slot = slots.find(
                          s => s.classId === cls.id && s.day === day && s.period === p
                        );

                        const teacher = slot?.teacherId ? teacherMap.get(slot.teacherId) : null;
                        const subject = slot?.subjectId ? subjectMap.get(slot.subjectId) : null;
                        const isClashing = clashSlotSet.has(`${day}_${p}_${cls.id}`);

                        // Filter highlight if query active
                        const matchesSearch =
                          searchQuery &&
                          (teacher?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            teacher?.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            subject?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            subject?.tamilName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            subject?.code.toLowerCase().includes(searchQuery.toLowerCase()));

                        const subjectDisplayName = isTa && subject?.tamilName ? subject.tamilName : subject?.name || '';
                        const teacherDisplayName = isTa && teacher?.nameTamil ? teacher.code : teacher?.code || '';

                        // Dynamic heat-intensity background for cells
                        let teacherCellBg = 'bg-white hover:bg-blue-100 text-blue-900';
                        let subjectCellBg = 'bg-white hover:bg-blue-100 text-slate-800';

                        if (isClashing) {
                          teacherCellBg = 'bg-rose-100 text-rose-950 border-2 border-rose-500 font-bold animate-pulse';
                          subjectCellBg = 'bg-rose-100 text-rose-950 border-2 border-rose-500 font-bold animate-pulse';
                        } else if (matchesSearch) {
                          teacherCellBg = 'bg-amber-100 text-amber-950 font-bold';
                          subjectCellBg = 'bg-amber-100 text-amber-950 font-bold';
                        } else if (slot) {
                          if (showHeatmap && heatInfo) {
                            if (heatInfo.intensity === 'critical') {
                              teacherCellBg = 'bg-rose-50/90 hover:bg-rose-100 text-rose-950 font-semibold';
                              subjectCellBg = 'bg-rose-50/90 hover:bg-rose-100 text-rose-950';
                            } else if (heatInfo.intensity === 'high') {
                              teacherCellBg = 'bg-amber-50/90 hover:bg-amber-100 text-amber-950 font-semibold';
                              subjectCellBg = 'bg-amber-50/80 hover:bg-amber-100 text-amber-950';
                            } else if (heatInfo.intensity === 'moderate') {
                              teacherCellBg = 'bg-yellow-50/60 hover:bg-yellow-100 text-slate-900 font-medium';
                              subjectCellBg = 'bg-yellow-50/50 hover:bg-yellow-100 text-slate-800';
                            } else {
                              teacherCellBg = 'bg-white hover:bg-blue-50 text-slate-800';
                              subjectCellBg = 'bg-white hover:bg-blue-50 text-slate-800';
                            }
                          } else {
                            teacherCellBg = 'bg-white hover:bg-blue-100 text-blue-900';
                            subjectCellBg = 'bg-white hover:bg-blue-100 text-slate-800';
                          }
                        } else {
                          teacherCellBg =
                            showHeatmap && heatInfo?.intensity === 'critical'
                              ? 'bg-rose-50/30 text-slate-300'
                              : 'bg-slate-50 hover:bg-blue-50 text-slate-300';
                          subjectCellBg = teacherCellBg;
                        }

                        return (
                          <React.Fragment key={`${cls.id}-${day}-${p}`}>
                            {/* Teacher Cell */}
                            <td
                              onClick={() => onSelectSlot(cls.id, day, p)}
                              className={`py-1.5 px-1.5 text-center font-mono font-medium text-xs cursor-pointer select-none transition-all ${teacherCellBg}`}
                              title={`Click to edit ${cls.name} ${day} Period ${p}${
                                heatInfo ? ` • ${heatInfo.unavailabilityRate}% Faculty Busy` : ''
                              }`}
                            >
                              {teacher ? (
                                <span className="font-semibold text-slate-800">{teacherDisplayName}</span>
                              ) : slot ? (
                                <span className="text-slate-400">-</span>
                              ) : (
                                <Plus className="w-3 h-3 mx-auto text-slate-300 opacity-60" />
                              )}
                            </td>

                            {/* Subject Cell */}
                            <td
                              onClick={() => onSelectSlot(cls.id, day, p)}
                              className={`py-1.5 px-2 text-center text-xs cursor-pointer select-none transition-all ${subjectCellBg}`}
                              title={`Click to edit ${cls.name} ${day} Period ${p}`}
                            >
                              {subject ? (
                                <span className="font-medium text-slate-900 truncate block max-w-[95px] mx-auto">
                                  {subjectDisplayName}
                                </span>
                              ) : (
                                <span className="text-slate-300 italic text-[11px]">-</span>
                              )}
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  );
                }
                return rowsForDay;
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info matching institutional style */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
          <div>
            {isTa
              ? `காட்டப்படும் வகுப்புகள்: ${classesToRender.length} (மொத்தம் 14 பிரிவுகள், 1 முதல் 12 வரை) · 40 பாடவேளைகள் / வாரம்`
              : `Showing ${classesToRender.length} Classes (Total 14 sections, Classes 1 to 12) · 40 Periods/Week`}
          </div>
          <div className="flex items-center flex-wrap gap-3.5">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-white border border-slate-300 rounded-xs"></span> {isTa ? 'வழக்கமான பாடம்' : 'Regular'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-yellow-50 border border-yellow-300 rounded-xs"></span> {isTa ? 'மிதமான தேவை' : 'Moderate'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-amber-100 border border-amber-400 rounded-xs"></span> {isTa ? 'அதிக ஆசிரியர் தேவை' : 'High Demand (≥50%)'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-rose-100 border border-rose-500 rounded-xs"></span> {isTa ? 'முரண்பாடு / உச்சக்கட்ட சுமை' : 'Conflict / Critical (≥70%)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
