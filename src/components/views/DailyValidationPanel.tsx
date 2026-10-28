import React, { useState, useMemo } from 'react';
import {
  TimetableSlot,
  ClassSection,
  Teacher,
  Subject,
  SubjectPeriodRequirement,
  DayOfWeek,
  SchoolConfig,
  AcademicStage,
} from '../../types/timetable';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Filter,
  Search,
  BookOpen,
  ArrowRight,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Calendar,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { LanguageMode } from '../Header';

export interface SubjectDayValidationItem {
  classId: string;
  className: string;
  classNameTamil?: string;
  stage: AcademicStage;
  stream?: string;
  subjectId: string;
  subjectName: string;
  subjectTamilName?: string;
  subjectCode: string;
  subjectColor: string;
  isPractical?: boolean;
  isLab?: boolean;
  requiredWeekly: number;
  allottedWeekly: number;
  weeklyDeficit: number; // positive = shortage, negative = excess, 0 = matched
  status: 'met' | 'deficit' | 'excess' | 'unallotted';
  dailyDeficits: {
    day: DayOfWeek;
    dayTamil: string;
    required: number;
    allotted: number;
    difference: number; // positive = missing on this day
  }[];
  conflictDescription: string;
  conflictDescriptionTamil: string;
  assignedTeacherName?: string;
  assignedTeacherCode?: string;
  isCombined?: boolean;
  combinedWith?: string[];
}

interface DailyValidationPanelProps {
  config: SchoolConfig;
  classes: ClassSection[];
  teachers: Teacher[];
  subjects: Subject[];
  requirements: SubjectPeriodRequirement[];
  slots: TimetableSlot[];
  languageMode: LanguageMode;
  onSelectSlot?: (classId: string, day: DayOfWeek, period: number) => void;
  onNavigateToClass?: (classId: string) => void;
  onClose?: () => void;
  compact?: boolean;
}

export const DailyValidationPanel: React.FC<DailyValidationPanelProps> = ({
  config,
  classes,
  teachers,
  subjects,
  requirements,
  slots,
  languageMode,
  onSelectSlot,
  onNavigateToClass,
  onClose,
  compact = false,
}) => {
  const isTa = languageMode === 'ta';
  const isBi = languageMode === 'bilingual';

  // Filters state
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'deficit' | 'excess' | 'met'>('deficit');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const dayNamesTamil: Record<DayOfWeek, string> = {
    Monday: 'திங்கள்',
    Tuesday: 'செவ்வாய்',
    Wednesday: 'புதன்',
    Thursday: 'வியாழன்',
    Friday: 'வெள்ளி',
    Saturday: 'சனி',
  };

  const subjectMap = useMemo(() => new Map<string, Subject>(subjects.map(s => [s.id, s])), [subjects]);
  const teacherMap = useMemo(() => new Map<string, Teacher>(teachers.map(t => [t.id, t])), [teachers]);
  const classMap = useMemo(() => new Map<string, ClassSection>(classes.map(c => [c.id, c])), [classes]);

  // Compute validation results directly from requirements data vs allotted slots
  const validationItems = useMemo<SubjectDayValidationItem[]>(() => {
    if (!requirements || requirements.length === 0) return [];

    const items: SubjectDayValidationItem[] = [];

    // Group requirements by classId and subjectId
    requirements.forEach(req => {
      const cls = classMap.get(req.classId);
      const sub = subjectMap.get(req.subjectId);
      if (!cls || !sub) return;

      const requiredWeekly = req.assignedPerWeek || 0;

      // Filter slots allotted to this class for this subject
      const classSlots = slots.filter(
        s => s.classId === req.classId && s.subjectId === req.subjectId
      );
      const allottedWeekly = classSlots.length;
      const weeklyDeficit = requiredWeekly - allottedWeekly;

      // Daily breakdown
      const dailyDeficits = config.days.map(day => {
        const required = req.dailyDistribution?.[day] || 0;
        const allotted = classSlots.filter(s => s.day === day).length;
        return {
          day,
          dayTamil: dayNamesTamil[day] || day,
          required,
          allotted,
          difference: required - allotted,
        };
      });

      // Status determination
      let status: 'met' | 'deficit' | 'excess' | 'unallotted' = 'met';
      if (allottedWeekly === 0 && requiredWeekly > 0) {
        status = 'unallotted';
      } else if (weeklyDeficit > 0) {
        status = 'deficit';
      } else if (weeklyDeficit < 0) {
        status = 'excess';
      }

      // Check teacher info from slot or teacher mapping
      const firstSlotWithTeacher = classSlots.find(s => s.teacherId);
      const teacher = firstSlotWithTeacher?.teacherId ? teacherMap.get(firstSlotWithTeacher.teacherId) : undefined;

      // Identify specific subject-day conflict text
      // e.g. "Physics not met 3 times this week (4 allotted / 7 required)"
      let conflictDescription = '';
      let conflictDescriptionTamil = '';

      if (status === 'unallotted') {
        conflictDescription = `${sub.name} completely unallotted (0 of ${requiredWeekly} periods scheduled this week)`;
        conflictDescriptionTamil = `${sub.tamilName || sub.name} ஒதுக்கப்படவில்லை (வாரத்திற்கு ${requiredWeekly} பாடவேளைகளில் 0 மட்டுமே உள்ளது)`;
      } else if (status === 'deficit') {
        conflictDescription = `${sub.name} not met ${weeklyDeficit} times this week (${allottedWeekly} allotted / ${requiredWeekly} required)`;
        conflictDescriptionTamil = `${sub.tamilName || sub.name} இந்த வாரத்தில் ${weeklyDeficit} முறை பூர்த்தி செய்யப்படவில்லை (${allottedWeekly}/${requiredWeekly} ஒதுக்கப்பட்டது)`;
      } else if (status === 'excess') {
        const excess = Math.abs(weeklyDeficit);
        conflictDescription = `${sub.name} exceeds requirement by ${excess} period(s) (${allottedWeekly} allotted / ${requiredWeekly} required)`;
        conflictDescriptionTamil = `${sub.tamilName || sub.name} தேவையை விட ${excess} பாடவேளை அதிகமாக உள்ளது (${allottedWeekly}/${requiredWeekly})`;
      } else {
        // Weekly count is met, but check daily distribution mismatches
        const dayMismatches = dailyDeficits.filter(d => d.difference !== 0);
        if (dayMismatches.length > 0) {
          const missingDays = dayMismatches.filter(d => d.difference > 0).map(d => d.day).join(', ');
          conflictDescription = `${sub.name} weekly total met (7/7) but day distribution mismatched on: ${missingDays}`;
          conflictDescriptionTamil = `${sub.tamilName || sub.name} வாராந்திர எண்ணிக்கை பூர்த்தி (7/7) ஆனால் நாள்வாரியாக விடுபட்டுள்ளது: ${missingDays}`;
        } else {
          conflictDescription = `${sub.name} fully met (${allottedWeekly}/${requiredWeekly} periods distributed across all days)`;
          conflictDescriptionTamil = `${sub.tamilName || sub.name} 100% பூர்த்தி செய்யப்பட்டது (${allottedWeekly}/${requiredWeekly} பாடவேளைகள்)`;
        }
      }

      // Check if combined class
      const isCombined = classSlots.some(s => s.isCombined);
      const combinedWith = isCombined
        ? Array.from(new Set(classSlots.flatMap(s => s.combinedClassIds || []).filter(id => id !== req.classId)))
        : undefined;

      items.push({
        classId: req.classId,
        className: cls.name,
        classNameTamil: cls.nameTamil,
        stage: cls.stage,
        stream: cls.stream,
        subjectId: req.subjectId,
        subjectName: sub.name,
        subjectTamilName: sub.tamilName,
        subjectCode: sub.code,
        subjectColor: sub.color || '#2563eb',
        isPractical: sub.isPractical,
        isLab: sub.isLab,
        requiredWeekly,
        allottedWeekly,
        weeklyDeficit,
        status,
        dailyDeficits,
        conflictDescription,
        conflictDescriptionTamil,
        assignedTeacherName: teacher?.name,
        assignedTeacherCode: teacher?.code,
        isCombined,
        combinedWith,
      });
    });

    return items;
  }, [requirements, slots, classMap, subjectMap, teacherMap, config.days]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalRequirements = validationItems.length;
    const deficits = validationItems.filter(i => i.status === 'deficit' || i.status === 'unallotted');
    const fullyMet = validationItems.filter(i => i.status === 'met');
    const excess = validationItems.filter(i => i.status === 'excess');

    const totalRequiredPeriods = validationItems.reduce((sum, i) => sum + i.requiredWeekly, 0);
    const totalAllottedPeriods = validationItems.reduce((sum, i) => sum + i.allottedWeekly, 0);
    const totalMissingPeriods = deficits.reduce((sum, i) => sum + Math.max(0, i.weeklyDeficit), 0);

    const complianceRate = totalRequiredPeriods > 0
      ? Math.min(100, Math.round((totalAllottedPeriods / totalRequiredPeriods) * 100))
      : 100;

    return {
      totalRequirements,
      deficitCount: deficits.length,
      fullyMetCount: fullyMet.length,
      excessCount: excess.length,
      totalRequiredPeriods,
      totalAllottedPeriods,
      totalMissingPeriods,
      complianceRate,
    };
  }, [validationItems]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return validationItems.filter(item => {
      // Stage filter
      if (selectedStage !== 'all' && item.stage !== selectedStage) {
        return false;
      }

      // Class filter
      if (selectedClassId !== 'all' && item.classId !== selectedClassId) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'deficit') {
        if (item.status !== 'deficit' && item.status !== 'unallotted') return false;
      } else if (selectedStatus === 'met') {
        if (item.status !== 'met') return false;
      } else if (selectedStatus === 'excess') {
        if (item.status !== 'excess') return false;
      }

      // Day filter: show items that have missing periods on the selected day
      if (selectedDay !== 'all') {
        const dayMatch = item.dailyDeficits.find(d => d.day === selectedDay);
        if (!dayMatch || dayMatch.difference <= 0) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSub =
          item.subjectName.toLowerCase().includes(query) ||
          item.subjectCode.toLowerCase().includes(query) ||
          item.subjectTamilName?.toLowerCase().includes(query);
        const matchesClass =
          item.className.toLowerCase().includes(query) ||
          item.classNameTamil?.toLowerCase().includes(query);
        const matchesTeacher =
          item.assignedTeacherName?.toLowerCase().includes(query) ||
          item.assignedTeacherCode?.toLowerCase().includes(query);
        if (!matchesSub && !matchesClass && !matchesTeacher) return false;
      }

      return true;
    });
  }, [validationItems, selectedStage, selectedClassId, selectedStatus, selectedDay, searchQuery]);

  const toggleExpand = (key: string) => {
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Export to CSV
  const exportValidationCSV = () => {
    const headers = [
      'Class',
      'Stage',
      'Subject Code',
      'Subject Name',
      'Teacher',
      'Required Weekly',
      'Allotted Weekly',
      'Deficit',
      'Status',
      'Mon Req/Allot',
      'Tue Req/Allot',
      'Wed Req/Allot',
      'Thu Req/Allot',
      'Fri Req/Allot',
      'Conflict Message',
    ];

    const rows = validationItems.map(item => {
      const mon = item.dailyDeficits.find(d => d.day === 'Monday');
      const tue = item.dailyDeficits.find(d => d.day === 'Tuesday');
      const wed = item.dailyDeficits.find(d => d.day === 'Wednesday');
      const thu = item.dailyDeficits.find(d => d.day === 'Thursday');
      const fri = item.dailyDeficits.find(d => d.day === 'Friday');

      return [
        `"${item.className}"`,
        `"${item.stage}"`,
        `"${item.subjectCode}"`,
        `"${item.subjectName}"`,
        `"${item.assignedTeacherName || 'Unassigned'}"`,
        item.requiredWeekly,
        item.allottedWeekly,
        item.weeklyDeficit,
        `"${item.status}"`,
        `"${mon?.required || 0}/${mon?.allotted || 0}"`,
        `"${tue?.required || 0}/${tue?.allotted || 0}"`,
        `"${wed?.required || 0}/${wed?.allotted || 0}"`,
        `"${thu?.required || 0}/${thu?.allotted || 0}"`,
        `"${fri?.required || 0}/${fri?.allotted || 0}"`,
        `"${item.conflictDescription.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `daily_validation_allotment_conflicts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden ${compact ? 'p-3' : 'p-5'} space-y-4`}>
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {isTa ? 'தினசரி & பாடவாரியான ஒதுக்கீட்டு சரிபார்ப்பு' : 'Daily & Subject Allotment Validation'}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                stats.deficitCount > 0
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {stats.deficitCount > 0
                  ? `${stats.deficitCount} ${isTa ? 'பற்றாக்குறைகள்' : 'Deficits'}`
                  : isTa ? 'முழுவதும் பூர்த்தி' : '100% Met'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isTa
                ? 'அரசாணை வழிகாட்டித் தேவைகளுடன் (Requirements Data) ஒப்பிட்டு, விடுபட்ட பாடவேளைகள் மற்றும் மோதல்களை முன்கூட்டியே கண்டறிகிறது.'
                : 'Directly validates subject requirements vs allotted slots before generating the full timetable.'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportValidationCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
            title="Download CSV Report"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>CSV</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 px-2 py-1 text-xs border border-slate-200 rounded-md"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            {isTa ? 'மொத்த தேவைகள்' : 'Subject Rules'}
          </div>
          <div className="text-xl font-bold font-mono text-slate-800 mt-1">
            {stats.totalRequirements}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isTa ? 'வகுப்பு 1 - 12' : 'Classes 1 - 12'}
          </div>
        </div>

        <div className={`border rounded-lg p-3 ${stats.deficitCount > 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-[11px] font-medium text-amber-900 uppercase tracking-wider flex items-center justify-between">
            <span>{isTa ? 'பூர்த்தி ஆகாதவை' : 'Unmet Deficits'}</span>
            {stats.deficitCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
          </div>
          <div className="text-xl font-bold font-mono text-amber-950 mt-1">
            {stats.deficitCount} <span className="text-xs font-normal text-amber-700">({stats.totalMissingPeriods} {isTa ? 'வேளைகள்' : 'slots'})</span>
          </div>
          <div className="text-[10px] text-amber-800 mt-0.5 font-medium">
            {stats.deficitCount > 0 ? (isTa ? 'முன்கூட்டியே சரிசெய்க' : 'Missing before full solve') : 'None'}
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3">
          <div className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider">
            {isTa ? 'முழுமையாக பூர்த்தியானவை' : 'Fully Met'}
          </div>
          <div className="text-xl font-bold font-mono text-emerald-950 mt-1">
            {stats.fullyMetCount}
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5">
            {stats.totalAllottedPeriods} / {stats.totalRequiredPeriods} {isTa ? 'பாடவேளைகள்' : 'periods'}
          </div>
        </div>

        <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3">
          <div className="text-[11px] font-medium text-blue-800 uppercase tracking-wider">
            {isTa ? 'இணக்க விகிதம்' : 'Compliance Rate'}
          </div>
          <div className="text-xl font-bold font-mono text-blue-950 mt-1">
            {stats.complianceRate}%
          </div>
          <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full ${stats.complianceRate >= 95 ? 'bg-emerald-600' : stats.complianceRate >= 70 ? 'bg-blue-600' : 'bg-amber-500'}`}
              style={{ width: `${stats.complianceRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Unmet Alert Banner */}
      {stats.deficitCount > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">
              {isTa ? 'கவனிக்க:' : 'Pre-Generation Inspection Notice:'}
            </span>{' '}
            {isTa
              ? `தற்போது ${stats.deficitCount} பாடங்களில் மொத்தம் ${stats.totalMissingPeriods} பாடவேளைகள் முழுமையாக ஒதுக்கப்படவில்லை. அட்டவணை முழுமையாக உருவாக்குவதற்கு முன் கீழ் காணும் குறிப்பிட்ட பாட-நாள் முரண்பாடுகளை சரிபார்க்கவும்.`
              : `Found ${stats.deficitCount} subjects with a total deficit of ${stats.totalMissingPeriods} period(s). Catching these specific subject-day conflicts below ensures the solver does not stall or violate departmental minimums.`}
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
        {/* Status Filter */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs bg-slate-50">
          <button
            onClick={() => setSelectedStatus('deficit')}
            className={`px-2.5 py-1 font-medium transition-colors ${
              selectedStatus === 'deficit'
                ? 'bg-amber-600 text-white font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isTa ? 'பற்றாக்குறைகள்' : 'Deficits Only'} ({stats.deficitCount})
          </button>
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-2.5 py-1 font-medium transition-colors border-l border-slate-200 ${
              selectedStatus === 'all'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isTa ? 'அனைத்தும்' : 'All'} ({stats.totalRequirements})
          </button>
          <button
            onClick={() => setSelectedStatus('met')}
            className={`px-2.5 py-1 font-medium transition-colors border-l border-slate-200 ${
              selectedStatus === 'met'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isTa ? 'பூர்த்தியானவை' : 'Fully Met'} ({stats.fullyMetCount})
          </button>
        </div>

        {/* Stage Filter */}
        <select
          value={selectedStage}
          onChange={e => setSelectedStage(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-blue-600 font-medium text-slate-700"
        >
          <option value="all">{isTa ? 'அனைத்து பிரிவுகளும் (1-12)' : 'All Stages (1-12)'}</option>
          <option value="higher-secondary">{isTa ? 'மேல்நிலை (11, 12)' : 'Higher Secondary (11-12)'}</option>
          <option value="high">{isTa ? 'உயர்நிலை (9, 10)' : 'High School (9-10)'}</option>
          <option value="middle">{isTa ? 'நடுநிலை (6, 7, 8)' : 'Middle (6-8)'}</option>
          <option value="primary">{isTa ? 'தொடக்க நிலை (1-5)' : 'Primary (1-5)'}</option>
        </select>

        {/* Class Filter */}
        <select
          value={selectedClassId}
          onChange={e => setSelectedClassId(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-blue-600 font-medium text-slate-700 max-w-[180px]"
        >
          <option value="all">{isTa ? 'அனைத்து வகுப்புகள்' : 'All Classes'}</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>
              {isTa ? c.nameTamil || c.name : c.name}
            </option>
          ))}
        </select>

        {/* Day Filter */}
        <select
          value={selectedDay}
          onChange={e => setSelectedDay(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-blue-600 font-medium text-slate-700"
        >
          <option value="all">{isTa ? 'அனைத்து நாட்கள்' : 'All Days'}</option>
          {config.days.map(d => (
            <option key={d} value={d}>
              {isTa ? dayNamesTamil[d] : d}
            </option>
          ))}
        </select>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[160px]">
          <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isTa ? 'பாடம் அல்லது வகுப்பைத் தேடுக...' : 'Search subject / class...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Validation Items List */}
      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="font-semibold text-sm text-slate-700">
              {isTa ? 'பொருந்தும் பற்றாக்குறைகள் எதுவும் இல்லை!' : 'No Matching Conflicts or Deficits Found!'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isTa
                ? 'தேர்வு செய்யப்பட்ட பிரிவில் அனைத்துப் பாடங்களும் அரசாணை தேவைகளின்படி சரியாக ஒதுக்கப்பட்டுள்ளன.'
                : 'All subject allotments for this filter meet the required weekly and daily period counts.'}
            </p>
          </div>
        ) : (
          filteredItems.map(item => {
            const itemKey = `${item.classId}-${item.subjectId}`;
            const isExpanded = expandedItems[itemKey] ?? (item.status === 'deficit' || item.status === 'unallotted');

            return (
              <div
                key={itemKey}
                className={`border rounded-lg transition-all ${
                  item.status === 'unallotted'
                    ? 'bg-rose-50/70 border-rose-300'
                    : item.status === 'deficit'
                    ? 'bg-amber-50/60 border-amber-300'
                    : item.status === 'excess'
                    ? 'bg-purple-50/60 border-purple-200'
                    : 'bg-emerald-50/30 border-emerald-200'
                }`}
              >
                {/* Main Card Header */}
                <div
                  onClick={() => toggleExpand(itemKey)}
                  className="p-3 cursor-pointer flex flex-wrap items-center justify-between gap-2.5 hover:opacity-95"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-[260px]">
                    {/* Status Icon */}
                    <div className="shrink-0">
                      {item.status === 'unallotted' ? (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      ) : item.status === 'deficit' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      ) : item.status === 'excess' ? (
                        <Info className="w-5 h-5 text-purple-600" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>

                    {/* Class & Subject Tag */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono shadow-2xs">
                          {isTa ? item.classNameTamil || item.className : item.className}
                        </span>

                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-2xs"
                          style={{ backgroundColor: item.subjectColor }}
                        >
                          {item.subjectCode}
                        </span>

                        <span className="text-xs font-semibold text-slate-800">
                          {isTa ? item.subjectTamilName || item.subjectName : isBi ? `${item.subjectName} (${item.subjectTamilName || ''})` : item.subjectName}
                        </span>

                        {item.isPractical && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">
                            {isTa ? 'செய்முறை' : 'Practical'}
                          </span>
                        )}

                        {item.isCombined && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {isTa ? 'இணைப்பு வகுப்பு' : 'Combined'}
                          </span>
                        )}
                      </div>

                      {/* Conflict Message */}
                      <div className="text-xs font-medium">
                        {item.status === 'deficit' || item.status === 'unallotted' ? (
                          <span className="text-rose-900 font-semibold">
                            ⚠️ {isTa ? item.conflictDescriptionTamil : item.conflictDescription}
                          </span>
                        ) : item.status === 'excess' ? (
                          <span className="text-purple-900 font-medium">
                            ℹ️ {isTa ? item.conflictDescriptionTamil : item.conflictDescription}
                          </span>
                        ) : (
                          <span className="text-emerald-800">
                            ✓ {isTa ? item.conflictDescriptionTamil : item.conflictDescription}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side stats pill & chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-slate-900">
                        {item.allottedWeekly} / {item.requiredWeekly}{' '}
                        <span className="text-[10px] font-normal text-slate-500">
                          {isTa ? 'வேளைகள்' : 'periods'}
                        </span>
                      </div>
                      <div className="text-[10px] font-semibold">
                        {item.weeklyDeficit > 0 ? (
                          <span className="text-rose-600">
                            -{item.weeklyDeficit} {isTa ? 'பற்றாக்குறை' : 'Deficit'}
                          </span>
                        ) : item.weeklyDeficit < 0 ? (
                          <span className="text-purple-600">
                            +{Math.abs(item.weeklyDeficit)} {isTa ? 'அதிகம்' : 'Extra'}
                          </span>
                        ) : (
                          <span className="text-emerald-600">{isTa ? 'சரியானது' : '100% Met'}</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Daily Allotment Breakdown */}
                {isExpanded && (
                  <div className="p-3 border-t border-slate-200/80 bg-white/90 space-y-2.5">
                    {/* Daily Distribution Chips */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <span>{isTa ? 'நாள் வாரியான ஒப்பீடு (ஒதுக்கீடு / தேவை)' : 'Day-Wise Distribution (Allotted vs Required)'}</span>
                        {item.assignedTeacherName && (
                          <span className="text-slate-600 font-medium">
                            {isTa ? 'ஆசிரியர்:' : 'Faculty:'} <strong>{item.assignedTeacherName}</strong> ({item.assignedTeacherCode})
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {item.dailyDeficits.map(d => {
                          const isMet = d.required === d.allotted;
                          const isMissing = d.required > d.allotted;
                          const isOver = d.allotted > d.required;

                          return (
                            <div
                              key={d.day}
                              className={`p-2 rounded border text-center transition-all ${
                                isMissing
                                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                                  : isOver
                                  ? 'bg-purple-50 border-purple-200 text-purple-950'
                                  : d.required > 0
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                                  : 'bg-slate-50 border-slate-200 text-slate-500'
                              }`}
                            >
                              <div className="text-[11px] font-bold font-mono">
                                {isTa ? d.dayTamil : d.day.slice(0, 3)}
                              </div>
                              <div className="text-xs font-mono font-extrabold mt-0.5">
                                {d.allotted} / {d.required}
                              </div>
                              <div className="text-[9px] mt-0.5 font-semibold">
                                {isMissing ? (
                                  <span className="text-rose-600">
                                    {isTa ? `${d.difference} விடுபட்டது` : `-${d.difference} missing`}
                                  </span>
                                ) : isOver ? (
                                  <span className="text-purple-600">
                                    {isTa ? `+${d.allotted - d.required} அதிகம்` : `+${d.allotted - d.required} extra`}
                                  </span>
                                ) : d.required > 0 ? (
                                  <span className="text-emerald-700">✓ {isTa ? 'சரி' : 'Met'}</span>
                                ) : (
                                  <span className="text-slate-400">{isTa ? 'தேவையில்லை' : 'Off'}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick navigation or slot fix suggestion */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-100 text-xs">
                      <div className="text-[11px] text-slate-500">
                        {item.weeklyDeficit > 0 ? (
                          <span>
                            👉 {isTa ? `இந்த வகுப்பிற்கு இன்னும் ${item.weeklyDeficit} பாடவேளையை ஒதுக்க அட்டவணையைத் திறக்கவும்.` : `Needs ${item.weeklyDeficit} more period(s) in this class schedule.`}
                          </span>
                        ) : (
                          <span>
                            ✓ {isTa ? 'இந்த பாடம் அரசாணை விதிமுறைப்படி சரியாக ஒதுக்கப்பட்டுள்ளது.' : 'Compliant with Tamil Nadu school education timetable norms.'}
                          </span>
                        )}
                      </div>

                      {onNavigateToClass && (
                        <button
                          onClick={() => onNavigateToClass(item.classId)}
                          className="flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline"
                        >
                          <span>{isTa ? 'வகுப்பு அட்டவணைக்குச் செல்க' : 'View Class Schedule'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
