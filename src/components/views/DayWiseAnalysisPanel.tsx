import React, { useState, useMemo } from 'react';
import {
  TimetableSlot,
  ClassSection,
  Teacher,
  Subject,
  DayOfWeek,
  SchoolConfig,
  TimetableClash,
} from '../../types/timetable';
import {
  BarChart3,
  FlaskConical,
  Sprout,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
  Layers,
  Calendar,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LanguageMode } from '../Header';

interface DayWiseAnalysisPanelProps {
  config: SchoolConfig;
  slots: TimetableSlot[];
  classes: ClassSection[];
  teachers: Teacher[];
  subjects: Subject[];
  clashes: TimetableClash[];
  languageMode: LanguageMode;
  initialSelectedDay?: string;
  onClose?: () => void;
}

export const DayWiseAnalysisPanel: React.FC<DayWiseAnalysisPanelProps> = ({
  config,
  slots,
  classes,
  teachers,
  subjects,
  clashes,
  languageMode,
  initialSelectedDay = 'all',
  onClose,
}) => {
  const [activeDay, setActiveDay] = useState<string>(
    initialSelectedDay === 'all' ? 'all' : initialSelectedDay
  );
  const [showSubjectDetails, setShowSubjectDetails] = useState<boolean>(true);

  const isTa = languageMode === 'ta';

  const subjectMap = useMemo(() => new Map<string, Subject>(subjects.map(s => [s.id, s])), [subjects]);
  const teacherMap = useMemo(() => new Map<string, Teacher>(teachers.map(t => [t.id, t])), [teachers]);
  const classMap = useMemo(() => new Map<string, ClassSection>(classes.map(c => [c.id, c])), [classes]);

  const maxPeriods = config.defaultPeriodsPerDay || 8;

  const dayNamesTamil: Record<DayOfWeek, string> = {
    Monday: 'திங்கள்',
    Tuesday: 'செவ்வாய்',
    Wednesday: 'புதன்',
    Thursday: 'வியாழன்',
    Friday: 'வெள்ளி',
    Saturday: 'சனி',
  };

  // Helper to categorize subjects
  const getSubjectCategory = (subject?: Subject): 'science_practical' | 'vocational_practical' | 'language' | 'core' | 'eca' => {
    if (!subject) return 'core';
    if (subject.isPractical) {
      return subject.practicalGroup === 'vocational' ? 'vocational_practical' : 'science_practical';
    }
    if (subject.id === 'sub-tam' || subject.id === 'sub-eng' || subject.code === 'TAM' || subject.code === 'ENG') {
      return 'language';
    }
    if (subject.isECA || subject.id === 'sub-pet' || subject.id === 'sub-cca-eca' || subject.id === 'sub-lib-val') {
      return 'eca';
    }
    return 'core';
  };

  // Calculate day-specific metrics
  const dayStats = useMemo(() => {
    const stats: Record<
      DayOfWeek,
      {
        totalSlots: number;
        filledSlots: number;
        sciencePracticals: number;
        vocationalPracticals: number;
        totalPracticals: number;
        languages: number;
        coreAcademics: number;
        ecaPeriods: number;
        // Period-wise breakdown
        periodBreakdown: {
          period: number;
          activeClasses: number;
          activeTeachers: number;
          teacherOccupancyRate: number;
          practicalSlots: {
            slot: TimetableSlot;
            subject: Subject;
            classSection?: ClassSection;
            teacher?: Teacher;
          }[];
          clashesCount: number;
          isBottleneck: boolean;
          bottleneckReason?: string;
          bottleneckReasonTamil?: string;
        }[];
        // Subject breakdown
        subjectCounts: Map<string, { count: number; classes: Set<string>; teachers: Set<string> }>;
        // Bottlenecks identified for this day
        bottlenecks: {
          id: string;
          level: 'high' | 'medium' | 'info';
          title: string;
          titleTamil: string;
          description: string;
          descriptionTamil: string;
          period?: number;
        }[];
      }
    > = {} as any;

    config.days.forEach(day => {
      const daySlots = slots.filter(s => s.day === day && s.subjectId && s.subjectId.trim() !== '');
      const subjectCounts = new Map<string, { count: number; classes: Set<string>; teachers: Set<string> }>();

      let sciPrac = 0;
      let vocPrac = 0;
      let langs = 0;
      let cores = 0;
      let ecas = 0;

      daySlots.forEach(s => {
        const sub = subjectMap.get(s.subjectId);
        const cat = getSubjectCategory(sub);

        if (cat === 'science_practical') sciPrac++;
        else if (cat === 'vocational_practical') vocPrac++;
        else if (cat === 'language') langs++;
        else if (cat === 'eca') ecas++;
        else cores++;

        // Aggregate subject counts
        const current = subjectCounts.get(s.subjectId) || {
          count: 0,
          classes: new Set<string>(),
          teachers: new Set<string>(),
        };
        current.count++;
        current.classes.add(s.classId);
        if (s.teacherId) current.teachers.add(s.teacherId);
        subjectCounts.set(s.subjectId, current);
      });

      // Period breakdown
      const periodBreakdown = [];
      const bottlenecks: {
        id: string;
        level: 'high' | 'medium' | 'info';
        title: string;
        titleTamil: string;
        description: string;
        descriptionTamil: string;
        period?: number;
      }[] = [];

      for (let p = 1; p <= maxPeriods; p++) {
        const slotsInP = daySlots.filter(s => s.period === p);
        const activeTeachersSet = new Set(slotsInP.filter(s => s.teacherId).map(s => s.teacherId));
        const activeTeachers = activeTeachersSet.size;
        const totalTeachersCount = teachers.length || 30;
        const teacherOccupancyRate = Math.round((activeTeachers / totalTeachersCount) * 100);

        const practicalSlots = slotsInP
          .filter(s => {
            const sub = subjectMap.get(s.subjectId);
            return sub?.isPractical;
          })
          .map(s => ({
            slot: s,
            subject: subjectMap.get(s.subjectId)!,
            classSection: classMap.get(s.classId),
            teacher: teacherMap.get(s.teacherId),
          }));

        const clashesInP = clashes.filter(c => c.day === day && c.period === p).length;

        let isBottleneck = false;
        let bottleneckReason: string | undefined;
        let bottleneckReasonTamil: string | undefined;

        // Bottleneck criteria 1: Lab/Practical Concurrency >= 4
        if (practicalSlots.length >= 4) {
          isBottleneck = true;
          bottleneckReason = `High Lab Concurrency: ${practicalSlots.length} simultaneous practical sessions.`;
          bottleneckReasonTamil = `அதிக ஆய்வக நெரிசல்: ஒரே நேரத்தில் ${practicalSlots.length} செய்முறை வகுப்புகள்.`;

          bottlenecks.push({
            id: `btn-lab-${day}-${p}`,
            level: practicalSlots.length >= 5 ? 'high' : 'medium',
            title: `High Practical Concurrency (Period ${p})`,
            titleTamil: `அதிக செய்முறை நெரிசல் (பாடவேளை ${p})`,
            description: `Period ${p} has ${practicalSlots.length} classes holding practical sessions simultaneously. Verify lab space and assistant availability.`,
            descriptionTamil: `பாடவேளை ${p}-ல் ஒரே நேரத்தில் ${practicalSlots.length} வகுப்புகளுக்கு செய்முறை பயிற்சிகள் நடக்கின்றன. ஆய்வக இடவசதியை உறுதிப்படுத்தவும்.`,
            period: p,
          });
        }

        // Bottleneck criteria 2: Teacher occupancy >= 80% (few substitute teachers free)
        if (teacherOccupancyRate >= 80) {
          isBottleneck = true;
          bottleneckReason = `Peak Teacher Load: ${teacherOccupancyRate}% teachers active (${totalTeachersCount - activeTeachers} free).`;
          bottleneckReasonTamil = `ஆசிரியர் உச்ச சுமை: ${teacherOccupancyRate}% ஆசிரியர்கள் வகுப்பில் உள்ளனர் (${totalTeachersCount - activeTeachers} பேர் மட்டுமே ஓய்வு).`;

          bottlenecks.push({
            id: `btn-tch-${day}-${p}`,
            level: 'medium',
            title: `Peak Faculty Utilization (Period ${p})`,
            titleTamil: `ஆசிரியர் பற்றாக்குறை அழுத்தம் (பாடவேளை ${p})`,
            description: `${activeTeachers} out of ${totalTeachersCount} teachers (${teacherOccupancyRate}%) are actively teaching. Minimal buffer for substitute duty.`,
            descriptionTamil: `${totalTeachersCount} ஆசிரியர்களில் ${activeTeachers} ஆசிரியர்கள் (${teacherOccupancyRate}%) கற்பித்தலில் உள்ளனர். மாற்றுப்பணிக்கு குறைவானவர்களே உள்ளனர்.`,
            period: p,
          });
        }

        // Bottleneck criteria 3: Clashes in this period
        if (clashesInP > 0) {
          isBottleneck = true;
          bottleneckReason = `Schedule Clash: ${clashesInP} conflicts detected!`;
          bottleneckReasonTamil = `அட்டவணை மோதல்: ${clashesInP} முரண்பாடுகள் உள்ளன!`;

          bottlenecks.push({
            id: `btn-clash-${day}-${p}`,
            level: 'high',
            title: `Schedule Collision Detected (Period ${p})`,
            titleTamil: `அட்டவணை முரண்பாடு கண்டறியப்பட்டது (பாடவேளை ${p})`,
            description: `${clashesInP} timetable collisions or double-bookings flag this period. Immediate resolution recommended.`,
            descriptionTamil: `பாடவேளை ${p}-ல் ${clashesInP} நேர முரண்பாடுகள் உள்ளன. உடனடியாக திருத்தம் தேவை.`,
            period: p,
          });
        }

        periodBreakdown.push({
          period: p,
          activeClasses: slotsInP.length,
          activeTeachers,
          teacherOccupancyRate,
          practicalSlots,
          clashesCount: clashesInP,
          isBottleneck,
          bottleneckReason,
          bottleneckReasonTamil,
        });
      }

      // Check afternoon vs morning practical distribution
      const morningPracs = periodBreakdown
        .filter(pb => pb.period <= 4)
        .reduce((sum, pb) => sum + pb.practicalSlots.length, 0);
      const afternoonPracs = periodBreakdown
        .filter(pb => pb.period > 4)
        .reduce((sum, pb) => sum + pb.practicalSlots.length, 0);

      if (morningPracs > afternoonPracs && sciPrac + vocPrac > 4) {
        bottlenecks.push({
          id: `btn-timing-${day}`,
          level: 'info',
          title: 'Morning Practical Concentration',
          titleTamil: 'காலை வேளையில் அதிக செய்முறை வகுப்புகள்',
          description: `${morningPracs} practicals scheduled in morning (Periods 1-4) vs ${afternoonPracs} in afternoon. TN norms recommend holding 2-period lab blocks in the afternoon.`,
          descriptionTamil: `காலை வேளையில் ${morningPracs} செய்முறைகளும், மதிய வேளையில் ${afternoonPracs} செய்முறைகளும் உள்ளன. அரசு வழிகாட்டுதலின்படி மதிய வேளை ஆய்வகங்களுக்கு உகந்தது.`,
        });
      }

      stats[day] = {
        totalSlots: classes.length * maxPeriods,
        filledSlots: daySlots.length,
        sciencePracticals: sciPrac,
        vocationalPracticals: vocPrac,
        totalPracticals: sciPrac + vocPrac,
        languages: langs,
        coreAcademics: cores,
        ecaPeriods: ecas,
        periodBreakdown,
        subjectCounts,
        bottlenecks,
      };
    });

    return stats;
  }, [config.days, slots, classes, teachers, subjects, clashes, maxPeriods, subjectMap, teacherMap, classMap]);

  // Overall totals across all days
  const overallTotals = useMemo(() => {
    let totalSciPrac = 0;
    let totalVocPrac = 0;
    let totalLangs = 0;
    let totalCores = 0;
    let totalEcas = 0;
    let totalFilled = 0;
    let allBottlenecksCount = 0;

    config.days.forEach(d => {
      const s = dayStats[d];
      if (s) {
        totalSciPrac += s.sciencePracticals;
        totalVocPrac += s.vocationalPracticals;
        totalLangs += s.languages;
        totalCores += s.coreAcademics;
        totalEcas += s.ecaPeriods;
        totalFilled += s.filledSlots;
        allBottlenecksCount += s.bottlenecks.filter(b => b.level === 'high' || b.level === 'medium').length;
      }
    });

    return {
      sciencePracticals: totalSciPrac,
      vocationalPracticals: totalVocPrac,
      totalPracticals: totalSciPrac + totalVocPrac,
      languages: totalLangs,
      coreAcademics: totalCores,
      ecaPeriods: totalEcas,
      filledSlots: totalFilled,
      bottlenecksCount: allBottlenecksCount,
    };
  }, [config.days, dayStats]);

  const currentDayStats = activeDay === 'all' ? null : dayStats[activeDay as DayOfWeek];

  return (
    <div className="bg-white rounded-2xl border border-slate-300/90 shadow-sm overflow-hidden no-print animate-in fade-in duration-200">
      {/* Panel Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight">
                  {isTa ? 'நாள் வாரியான பகுப்பாய்வு & அட்டவணை நெரிசல்' : 'Day-Wise Analysis & Schedule Bottlenecks'}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-200 border border-blue-300/30">
                  {isTa ? 'அரசு கால அட்டவணை ஆய்வு' : 'Norms Analysis'}
                </span>
              </div>
              <p className="text-xs text-blue-200/90 mt-0.5">
                {isTa
                  ? 'ஒவ்வொரு நாளின் பாடப் பரவல், செய்முறை வகுப்புகள் (அறிவியல் & தொழிற்கல்வி) மற்றும் ஆசிரியர் தேவை நெரிசல்களைக் கண்காணிக்கவும்.'
                  : 'Monitor daily subject distribution, Science & Vocational practical load, and concurrent bottleneck pinches.'}
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2">
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-right text-xs">
              <span className="text-blue-200 block text-[10px] uppercase font-semibold">
                {isTa ? 'மொத்த செய்முறைகள்' : 'Total Practicals'}
              </span>
              <span className="font-bold text-sm font-mono text-emerald-300">
                {overallTotals.totalPracticals} {isTa ? 'வேளைகள்' : 'slots'}
              </span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 text-xs font-semibold px-2"
              >
                {isTa ? 'மூடுக' : 'Close'}
              </button>
            )}
          </div>
        </div>

        {/* Day Selector Pills */}
        <div className="flex items-center flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/10">
          <span className="text-xs text-blue-200 font-semibold mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {isTa ? 'நாள் தேர்வு:' : 'Select Day:'}
          </span>
          <button
            onClick={() => setActiveDay('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeDay === 'all'
                ? 'bg-white text-blue-900 shadow-md ring-2 ring-blue-300/50'
                : 'bg-white/10 hover:bg-white/20 text-blue-100'
            }`}
          >
            <span>{isTa ? 'அனைத்து நாட்கள்' : 'All Days Overview'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-950/40 text-blue-200 font-mono">
              5 {isTa ? 'நாட்கள்' : 'Days'}
            </span>
          </button>

          {config.days.map(day => {
            const dStat = dayStats[day];
            const hasHighBottleneck = dStat?.bottlenecks.some(b => b.level === 'high');
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeDay === day
                    ? 'bg-white text-blue-900 shadow-md ring-2 ring-blue-300/50'
                    : 'bg-white/10 hover:bg-white/20 text-blue-100'
                }`}
              >
                <span>{isTa ? dayNamesTamil[day] : day}</span>
                {dStat && (
                  <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-950/40 text-blue-200">
                    <span className="text-emerald-300 font-semibold">{dStat.totalPracticals}P</span>
                    {hasHighBottleneck && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Body */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* VIEW 1: SINGLE DAY DETAILED BREAKDOWN */}
        {activeDay !== 'all' && currentDayStats && (
          <div className="space-y-6">
            {/* Day Header Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 font-bold text-sm">
                  {activeDay.slice(0, 3)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>
                      {isTa ? `${dayNamesTamil[activeDay as DayOfWeek]} கிழமை அட்டவணை பகுப்பாய்வு` : `${activeDay} Schedule Analysis`}
                    </span>
                    <span className="text-xs font-medium text-slate-500 font-mono">
                      ({currentDayStats.filledSlots} / {currentDayStats.totalSlots} {isTa ? 'வேளைகள் ஒதுக்கீடு' : 'periods allotted'})
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    {isTa
                      ? 'அறிவியல் மற்றும் தொழிற்கல்வி செய்முறைகள், முக்கிய பாடங்கள் மற்றும் ஆசிரியர் சுமை விவரம்.'
                      : 'Science & Vocational practicals, core subjects, and faculty concurrency for this day.'}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {currentDayStats.bottlenecks.filter(b => b.level === 'high').length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{isTa ? 'அட்டவணை நெரிசல் கவனிக்கவும்' : 'Schedule Bottlenecks Present'}</span>
                  </span>
                ) : currentDayStats.bottlenecks.filter(b => b.level === 'medium').length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{isTa ? 'மிதமான நெரிசல்' : 'Moderate Bottlenecks'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{isTa ? 'சமச்சீரான அட்டவணை' : 'Optimal & Balanced'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* KPI Cards: Subject & Practical Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Card 1: Science Practicals */}
              <div className="bg-gradient-to-br from-cyan-50/70 to-blue-50/50 p-4 rounded-xl border border-cyan-200/90 shadow-2xs flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-cyan-800 uppercase tracking-wider flex items-center gap-1">
                      <span>
                        <FlaskConical className="w-3.5 h-3.5 text-cyan-700" />
                      </span>
                      {isTa ? 'அறிவியல் செய்முறைகள்' : 'Science Practicals'}
                    </span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-cyan-950 font-mono">
                        {currentDayStats.sciencePracticals}
                      </span>
                      <span className="text-xs text-cyan-700 font-medium">
                        {isTa ? 'வேளைகள்' : 'periods'}
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                    <span>
                      <FlaskConical className="w-4 h-4 text-cyan-700" />
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-cyan-200/60 text-[10px] text-cyan-900 leading-tight">
                  <span className="font-semibold">{isTa ? 'பாடங்கள்:' : 'Subjects:'} </span>
                  Physics, Chemistry, CS, Bio-Botany, Bio-Zoology, Botany, Zoology
                </div>
              </div>

              {/* Card 2: Vocational Practicals */}
              <div className="bg-gradient-to-br from-amber-50/70 to-yellow-50/50 p-4 rounded-xl border border-amber-200/90 shadow-2xs flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                      <Sprout className="w-3.5 h-3.5 text-amber-700" />
                      {isTa ? 'தொழிற்கல்வி செய்முறைகள்' : 'Vocational Practicals'}
                    </span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-mono">
                        {currentDayStats.vocationalPracticals}
                      </span>
                      <span className="text-xs text-amber-800 font-medium">
                        {isTa ? 'வேளைகள்' : 'periods'}
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Sprout className="w-4 h-4 text-amber-700" />
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-200/60 text-[10px] text-amber-900 leading-tight">
                  <span className="font-semibold">{isTa ? 'பாடங்கள்:' : 'Subjects:'} </span>
                  Agri-Practical (Agri-P), Employability Skills (ES)
                </div>
              </div>

              {/* Card 3: Core Academic & Languages */}
              <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50/50 p-4 rounded-xl border border-indigo-200/90 shadow-2xs flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-700" />
                      {isTa ? 'முக்கிய & மொழிப் பாடங்கள்' : 'Core & Languages'}
                    </span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-indigo-950 font-mono">
                        {currentDayStats.languages + currentDayStats.coreAcademics}
                      </span>
                      <span className="text-xs text-indigo-700 font-medium">
                        ({currentDayStats.languages} {isTa ? 'மொழி' : 'Lang'} + {currentDayStats.coreAcademics} {isTa ? 'முக்கிய' : 'Core'})
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 text-indigo-700" />
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-indigo-200/60 text-[10px] text-indigo-900 leading-tight">
                  <span className="font-semibold">{isTa ? 'மொழி:' : 'Languages:'} </span>
                  Tamil, English · {isTa ? 'கோட்பாடு:' : 'Theory:'} Maths, Sci, Soc, etc.
                </div>
              </div>

              {/* Card 4: Co-Curricular & Well-being */}
              <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/50 p-4 rounded-xl border border-emerald-200/90 shadow-2xs flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-emerald-700" />
                      {isTa ? 'உடற்கல்வி & இணைச் செயல்பாடு' : 'PET / CCA / Well-being'}
                    </span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono">
                        {currentDayStats.ecaPeriods}
                      </span>
                      <span className="text-xs text-emerald-700 font-medium">
                        {isTa ? 'வேளைகள்' : 'periods'}
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-emerald-700" />
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-200/60 text-[10px] text-emerald-900 leading-tight">
                  <span className="font-semibold">{isTa ? 'செயல்பாடுகள்:' : 'Activities:'} </span>
                  PET, CCA/ECA, Library, Value Ed, SPARK, Art/SEL
                </div>
              </div>
            </div>

            {/* Visual Ratio Progress Bar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  {isTa ? 'பாட வகைகளின் ஒப்பீட்டு விகிதம்' : 'Day Subject Composition Ratio'}
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {currentDayStats.filledSlots} {isTa ? 'வேளைகள் பூர்த்தி' : 'total periods'}
                </span>
              </div>
              <div className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                {currentDayStats.filledSlots > 0 && (
                  <>
                    <div
                      style={{ width: `${(currentDayStats.sciencePracticals / currentDayStats.filledSlots) * 100}%` }}
                      className="bg-cyan-500 hover:bg-cyan-600 transition-all"
                      title={`Science Practicals: ${currentDayStats.sciencePracticals}`}
                    />
                    <div
                      style={{ width: `${(currentDayStats.vocationalPracticals / currentDayStats.filledSlots) * 100}%` }}
                      className="bg-amber-500 hover:bg-amber-600 transition-all"
                      title={`Vocational Practicals: ${currentDayStats.vocationalPracticals}`}
                    />
                    <div
                      style={{ width: `${(currentDayStats.languages / currentDayStats.filledSlots) * 100}%` }}
                      className="bg-sky-600 hover:bg-sky-700 transition-all"
                      title={`Languages: ${currentDayStats.languages}`}
                    />
                    <div
                      style={{ width: `${(currentDayStats.coreAcademics / currentDayStats.filledSlots) * 100}%` }}
                      className="bg-indigo-600 hover:bg-indigo-700 transition-all"
                      title={`Core Academic: ${currentDayStats.coreAcademics}`}
                    />
                    <div
                      style={{ width: `${(currentDayStats.ecaPeriods / currentDayStats.filledSlots) * 100}%` }}
                      className="bg-emerald-500 hover:bg-emerald-600 transition-all"
                      title={`PET & CCA: ${currentDayStats.ecaPeriods}`}
                    />
                  </>
                )}
              </div>
              <div className="flex items-center flex-wrap gap-4 pt-1 text-[11px] text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span>{isTa ? 'அறிவியல் செய்முறை' : 'Science Lab'} ({currentDayStats.sciencePracticals})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>{isTa ? 'தொழிற்கல்வி செய்முறை' : 'Vocational Lab'} ({currentDayStats.vocationalPracticals})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                  <span>{isTa ? 'மொழிகள்' : 'Languages'} ({currentDayStats.languages})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span>{isTa ? 'முக்கிய பாடங்கள்' : 'Core Theory'} ({currentDayStats.coreAcademics})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>{isTa ? 'உடற்கல்வி/CCA' : 'PET/CCA'} ({currentDayStats.ecaPeriods})</span>
                </span>
              </div>
            </div>

            {/* BOTTLENECK DIAGNOSTICS & ALERTS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>{isTa ? 'அட்டவணை நெரிசல் பகுப்பாய்வு & பரிசோதனை' : 'Schedule Bottlenecks & Diagnostic Health'}</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-500">
                  {currentDayStats.bottlenecks.length} {isTa ? 'குறிப்புகள்' : 'diagnostics'}
                </span>
              </div>

              {currentDayStats.bottlenecks.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-xs">
                      {isTa ? 'இந்த நாளில் அட்டவணை நெரிசல் ஏதுமில்லை!' : 'No Schedule Bottlenecks Detected on this Day!'}
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      {isTa
                        ? 'செய்முறை வகுப்புகள், ஆசிரியர் பணிப்பகிர்வு மற்றும் ஆய்வக பயன்பாடு சீராக பரவியுள்ளது.'
                        : 'Practicals, teacher occupancy, and laboratory resources are evenly distributed across all 8 periods.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentDayStats.bottlenecks.map(btn => {
                    let borderClass = 'border-amber-300 bg-amber-50/70 text-amber-950';
                    let badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
                    if (btn.level === 'high') {
                      borderClass = 'border-rose-300 bg-rose-50/70 text-rose-950';
                      badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
                    } else if (btn.level === 'info') {
                      borderClass = 'border-blue-200 bg-blue-50/60 text-blue-950';
                      badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
                    }

                    return (
                      <div
                        key={btn.id}
                        className={`p-3.5 rounded-xl border shadow-2xs flex items-start gap-3 ${borderClass}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {btn.level === 'high' ? (
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                          ) : btn.level === 'info' ? (
                            <Info className="w-4 h-4 text-blue-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="font-bold text-xs tracking-tight">
                              {isTa ? btn.titleTamil : btn.title}
                            </h5>
                            {btn.period && (
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${badgeClass}`}>
                                P-{btn.period}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] opacity-90 mt-1 leading-relaxed">
                            {isTa ? btn.descriptionTamil : btn.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PERIOD-BY-PERIOD CONCURRENCY TIMELINE (P1 TO P8) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-700" />
                  <span>
                    {isTa
                      ? `${dayNamesTamil[activeDay as DayOfWeek]} - பாடவேளை வாரியான ஆசிரியர் & ஆய்வக பரவல் (1 முதல் 8)`
                      : `${activeDay} - Period-Wise Teacher & Lab Concurrency (Periods 1 to 8)`}
                  </span>
                </h4>
                <span className="text-[11px] text-slate-500">
                  {isTa ? 'செய்முறை ஆய்வகங்கள் சிறப்பித்துக் காட்டப்பட்டுள்ளது' : 'Practical lab sessions highlighted'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {currentDayStats.periodBreakdown.map(pb => {
                  const timing = config.periodTimings.find(t => t.period === pb.period);
                  const hasPrac = pb.practicalSlots.length > 0;
                  const isHeavy = pb.isBottleneck;

                  return (
                    <div
                      key={pb.period}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isHeavy
                          ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-200'
                          : hasPrac
                          ? 'bg-cyan-50/40 border-cyan-300 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-extrabold text-sm text-slate-900">
                            P-{pb.period}
                          </span>
                          {timing && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              ({timing.startTime} - {timing.endTime})
                            </span>
                          )}
                        </div>
                        {hasPrac && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-800 bg-cyan-100/90 px-1.5 py-0.5 rounded border border-cyan-300">
                            <span>
                              <FlaskConical className="w-3 h-3 text-cyan-700" />
                            </span>
                            <span>{pb.practicalSlots.length} {isTa ? 'செய்முறை' : 'Labs'}</span>
                          </span>
                        )}
                      </div>

                      {/* Metrics */}
                      <div className="mt-2.5 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {isTa ? 'செயலில் உள்ள ஆசிரியர்:' : 'Active Staff:'}
                          </span>
                          <span className="font-semibold text-slate-800 font-mono">
                            {pb.activeTeachers} / {teachers.length || 30} ({pb.teacherOccupancyRate}%)
                          </span>
                        </div>

                        {/* Teacher occupancy progress bar */}
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pb.teacherOccupancyRate}%` }}
                            className={`h-full rounded-full transition-all ${
                              pb.teacherOccupancyRate >= 80
                                ? 'bg-rose-500'
                                : pb.teacherOccupancyRate >= 60
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                        </div>

                        {/* Practical Sessions in this period */}
                        {hasPrac && (
                          <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block">
                              {isTa ? 'நடைபெறும் ஆய்வகங்கள்:' : 'Running Practical Labs:'}
                            </span>
                            <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
                              {pb.practicalSlots.map(({ slot, subject, classSection, teacher }) => (
                                <div
                                  key={slot.id}
                                  className={`text-[10px] px-2 py-1 rounded flex items-center justify-between gap-1 border ${
                                    subject.practicalGroup === 'vocational'
                                      ? 'bg-amber-100/70 border-amber-300 text-amber-950 font-medium'
                                      : 'bg-cyan-100/70 border-cyan-300 text-cyan-950 font-medium'
                                  }`}
                                >
                                  <div className="truncate flex-1">
                                    <strong className="text-slate-900">{classSection?.name || slot.classId}</strong>:{' '}
                                    <span>{isTa && subject.tamilName ? subject.tamilName : subject.name}</span>
                                  </div>
                                  <span className="text-[9px] text-slate-500 shrink-0 font-mono">
                                    {slot.room || classSection?.roomNumber || 'Lab'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {pb.bottleneckReason && (
                          <div className="mt-2 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            ⚠️ {isTa ? pb.bottleneckReasonTamil : pb.bottleneckReason}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SUBJECT DISTRIBUTION TABLE COLLAPSIBLE */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setShowSubjectDetails(!showSubjectDetails)}
                className="w-full p-3.5 bg-slate-100/70 hover:bg-slate-200/60 transition-colors flex items-center justify-between text-xs font-bold text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-700" />
                  <span>
                    {isTa
                      ? `${dayNamesTamil[activeDay as DayOfWeek]} - பாடவாரியான விரிவான ஒதுக்கீடு பட்டியல்`
                      : `${activeDay} - Detailed Subject Allotment Roster`}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-mono">
                    {currentDayStats.subjectCounts.size} {isTa ? 'பாடங்கள்' : 'Subjects'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <span>{showSubjectDetails ? (isTa ? 'மறைக்க' : 'Hide') : (isTa ? 'காட்ட' : 'Expand')}</span>
                  {showSubjectDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {showSubjectDetails && (
                <div className="p-3 overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-200/80 text-slate-700 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-300">
                        <th className="p-2">{isTa ? 'பாடம்' : 'Subject'}</th>
                        <th className="p-2">{isTa ? 'வகை' : 'Category'}</th>
                        <th className="p-2 text-center">{isTa ? 'வேளைகள்' : 'Periods Today'}</th>
                        <th className="p-2">{isTa ? 'வகுப்புகள்' : 'Classes Scheduled'}</th>
                        <th className="p-2">{isTa ? 'பணியில் உள்ள ஆசிரியர்கள்' : 'Teachers Assigned'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-normal">
                      {Array.from(currentDayStats.subjectCounts.entries())
                        .sort((a, b) => b[1].count - a[1].count)
                        .map(([subjectId, info]) => {
                          const sub = subjectMap.get(subjectId);
                          const cat = getSubjectCategory(sub);
                          const isPrac = sub?.isPractical;

                          return (
                            <tr key={subjectId} className="hover:bg-white transition-colors">
                              <td className="p-2 font-medium">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: sub?.color || '#64748b' }}
                                  />
                                  <div>
                                    <span className="font-bold text-slate-900">
                                      {isTa && sub?.tamilName ? sub.tamilName : sub?.name || subjectId}
                                    </span>
                                    <span className="text-[10px] text-slate-500 ml-1 font-mono">
                                      ({sub?.code})
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-2">
                                {isPrac ? (
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                      sub.practicalGroup === 'vocational'
                                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                                        : 'bg-cyan-100 text-cyan-800 border-cyan-300'
                                    }`}
                                  >
                                    {sub.practicalGroup === 'vocational'
                                      ? (isTa ? 'தொழிற்கல்வி செய்முறை' : 'Vocational Lab')
                                      : (isTa ? 'அறிவியல் செய்முறை' : 'Science Lab')}
                                  </span>
                                ) : cat === 'language' ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                                    {isTa ? 'மொழிப் பாடம்' : 'Language'}
                                  </span>
                                ) : cat === 'eca' ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    {isTa ? 'உடற்கல்வி/CCA' : 'PET/CCA'}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                                    {isTa ? 'முக்கிய பாடம்' : 'Core Theory'}
                                  </span>
                                )}
                              </td>
                              <td className="p-2 text-center font-bold font-mono text-slate-900">
                                {info.count}
                              </td>
                              <td className="p-2">
                                <div className="flex flex-wrap gap-1">
                                  {Array.from(info.classes).map(cid => {
                                    const cls = classMap.get(cid);
                                    return (
                                      <span
                                        key={cid}
                                        className="px-1.5 py-0.2 rounded bg-white text-slate-700 border border-slate-200 text-[10px] font-medium"
                                      >
                                        {cls?.name || cid}
                                      </span>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="p-2">
                                <div className="flex flex-wrap gap-1">
                                  {Array.from(info.teachers).map(tid => {
                                    const t = teacherMap.get(tid);
                                    return (
                                      <span
                                        key={tid}
                                        className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-semibold"
                                      >
                                        {t?.name || tid}
                                      </span>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: ALL DAYS SIDE-BY-SIDE COMPARISON */}
        {activeDay === 'all' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>{isTa ? 'வாரத்தின் 5 நாட்கள் ஒப்பீட்டு பார்வை' : '5-Day Comparative Schedule Overview'}</span>
                  <span className="text-xs font-medium text-slate-500 font-mono">
                    (Monday to Friday · 40 Periods/Class Norm)
                  </span>
                </h4>
                <p className="text-xs text-slate-500">
                  {isTa
                    ? 'ஒவ்வொரு நாளின் செய்முறை சுமை மற்றும் ஆசிரியர் பற்றாக்குறை ஒப்பீடு.'
                    : 'Compare practical loads and peak bottlenecks across all working days to ensure uniform distribution.'}
                </p>
              </div>

              {/* Overall Total Practicals Pill */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-cyan-100 text-cyan-900 rounded-lg text-xs font-bold border border-cyan-300">
                  🧪 {overallTotals.sciencePracticals} {isTa ? 'அறிவியல் செய்முறை' : 'Science Labs'}
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-bold border border-amber-300">
                  🌾 {overallTotals.vocationalPracticals} {isTa ? 'தொழிற்கல்வி செய்முறை' : 'Vocational Labs'}
                </span>
              </div>
            </div>

            {/* Daily Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {config.days.map(day => {
                const s = dayStats[day];
                if (!s) return null;
                const highBtn = s.bottlenecks.filter(b => b.level === 'high').length;
                const medBtn = s.bottlenecks.filter(b => b.level === 'medium').length;

                return (
                  <div
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="font-bold text-slate-900 group-hover:text-blue-900 text-sm">
                          {isTa ? dayNamesTamil[day] : day}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {s.filledSlots} {isTa ? 'வேளைகள்' : 'p'}
                        </span>
                      </div>

                      {/* Practical Numbers */}
                      <div className="mt-3 space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-cyan-50/70 border border-cyan-200">
                          <div className="flex items-center justify-between text-cyan-900 font-bold">
                            <span className="text-[11px] flex items-center gap-1">
                              <span>
                                <FlaskConical className="w-3 h-3 text-cyan-700" />
                              </span>
                              {isTa ? 'அறிவியல்:' : 'Science:'}
                            </span>
                            <span className="font-mono text-base">{s.sciencePracticals}</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
                          <div className="flex items-center justify-between text-amber-900 font-bold">
                            <span className="text-[11px] flex items-center gap-1">
                              <Sprout className="w-3 h-3 text-amber-700" />
                              {isTa ? 'தொழிற்கல்வி:' : 'Vocational:'}
                            </span>
                            <span className="font-mono text-base">{s.vocationalPracticals}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1 text-slate-600 font-medium">
                          <span>{isTa ? 'முக்கிய பாடங்கள்:' : 'Core Theory:'}</span>
                          <span className="font-mono font-bold text-slate-800">{s.coreAcademics}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                          <span>{isTa ? 'மொழிப் பாடங்கள்:' : 'Languages:'}</span>
                          <span className="font-mono font-bold text-slate-800">{s.languages}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                          <span>{isTa ? 'உடற்கல்வி / CCA:' : 'PET / CCA:'}</span>
                          <span className="font-mono font-bold text-slate-800">{s.ecaPeriods}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottlenecks Indicator Footer */}
                    <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      {highBtn > 0 ? (
                        <span className="text-rose-700 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>{highBtn} {isTa ? 'முரண்பாடுகள்' : 'Bottlenecks'}</span>
                        </span>
                      ) : medBtn > 0 ? (
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>{medBtn} {isTa ? 'நெரிசல்கள்' : 'Pinch Points'}</span>
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isTa ? 'சமச்சீர்' : 'Balanced'}</span>
                        </span>
                      )}

                      <span className="text-blue-700 font-semibold text-[10px] group-hover:underline">
                        {isTa ? 'ஆய்வு செய் →' : 'Inspect →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
