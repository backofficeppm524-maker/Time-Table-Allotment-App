import React, { useState } from 'react';
import {
  SubjectPeriodRequirement,
  ClassSection,
  Subject,
  DayOfWeek,
  SchoolConfig,
  AcademicStage,
} from '../../types/timetable';
import { CheckCircle2, AlertTriangle, Wand2, Layers, BookOpen } from 'lucide-react';
import { LanguageMode } from '../Header';

interface PeriodAllotmentViewProps {
  config: SchoolConfig;
  classes: ClassSection[];
  subjects: Subject[];
  requirements: SubjectPeriodRequirement[];
  languageMode: LanguageMode;
  onUpdateRequirement: (req: SubjectPeriodRequirement) => void;
  onAutoBalanceClass: (classId: string) => void;
}

export const PeriodAllotmentView: React.FC<PeriodAllotmentViewProps> = ({
  config,
  classes,
  subjects,
  requirements,
  languageMode,
  onUpdateRequirement,
  onAutoBalanceClass,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  const isTa = languageMode === 'ta';

  const dayNamesTamil: Record<DayOfWeek, string> = {
    Monday: 'திங்கள்',
    Tuesday: 'செவ்வாய்',
    Wednesday: 'புதன்',
    Thursday: 'வியாழன்',
    Friday: 'வெள்ளி',
    Saturday: 'சனி',
  };

  const filteredByStage = classes.filter(cls => {
    if (selectedStage === 'all') return true;
    return cls.stage === (selectedStage as AcademicStage);
  });

  const classesToRender =
    selectedClassId === 'all'
      ? filteredByStage
      : filteredByStage.filter(c => c.id === selectedClassId);

  const subjectMap = new Map<string, Subject>(subjects.map(s => [s.id, s]));

  const handleDistributionChange = (
    req: SubjectPeriodRequirement,
    day: DayOfWeek,
    value: number
  ) => {
    const safeVal = Math.max(0, isNaN(value) ? 0 : value);
    const updated: SubjectPeriodRequirement = {
      ...req,
      dailyDistribution: {
        ...req.dailyDistribution,
        [day]: safeVal,
      },
    };
    onUpdateRequirement(updated);
  };

  const handleAssignedChange = (
    req: SubjectPeriodRequirement,
    value: number
  ) => {
    const safeVal = Math.max(0, isNaN(value) ? 0 : value);
    const updated: SubjectPeriodRequirement = {
      ...req,
      assignedPerWeek: safeVal,
    };
    onUpdateRequirement(updated);
  };

  return (
    <div className="space-y-6">
      {/* Official Government Order Reference Summary Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm border border-blue-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-blue-950 font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wide">
                GOVT ORDER 2026-2027
              </span>
              <h3 className="font-bold text-sm tracking-wide">
                {isTa
                  ? 'பள்ளிக் கல்வித் துறை · திருத்திய கால அட்டவணை வழிகாட்டு நெறிமுறைகள்'
                  : 'Tamil Nadu School Education Dept · Revised Academic Norms (40 Periods/Week)'}
              </h3>
            </div>
            <p className="text-xs text-blue-200 max-w-3xl">
              {isTa
                ? 'விளையாட்டு, கலை மற்றும் கல்வி இணைச் செயல்பாடுகளுக்காக தினமும் ஒரு பிரிவேளை கட்டாய ஒதுக்கீடு. TN SPARK (செயற்கை நுண்ணறிவு, எந்திரனியல்), மொழி ஆய்வகம் மற்றும் விழுமியக் கல்வி பாடவேளைகள் சேர்க்கப்பட்டுள்ளன.'
                : 'Mandatory daily 1 period for Sports (PET), Arts & Co-Curricular Activities (CCA/ECA). Incorporates TN SPARK (AI & Robotics), Language Labs, and Library/Value Education.'}
            </p>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-emerald-400 font-bold">8 {isTa ? 'வேளைகள் / நாள்' : 'Periods/Day'}</span> · 
            <span className="text-white font-bold ml-1">40 {isTa ? 'வேளைகள் / வாரம்' : 'Periods/Week'}</span>
          </div>
        </div>
      </div>

      {/* View Header & Class Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>
              {isTa ? 'பாடவாரியான பாடவேளை ஒதுக்கீட்டு மேட்ரிக்ஸ்' : 'CLASS WISE SUBJECT WISE PERIOD ALLOTMENT'}
            </span>
            <span className="text-xs font-normal text-slate-500">
              · {isTa ? 'பக்கம் 2 & 4 அட்டவணை' : 'PDF Pages 2 & 4 Official Tables'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTa
              ? 'அரசாணைப்படி வாராந்திர இலக்கு 40 பாடவேளைகள் சமநிலையைக் கண்காணிக்கிறது.'
              : 'Target of 40 periods per week (8 periods x 5 days) balanced across subjects.'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Stage Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <Layers className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <button
              onClick={() => {
                setSelectedStage('all');
                setSelectedClassId('all');
              }}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedStage === 'all'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'அனைத்து (1-12)' : 'All (1-12)'}
            </button>
            <button
              onClick={() => {
                setSelectedStage('primary');
                setSelectedClassId('all');
              }}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedStage === 'primary'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'தொடக்க (1-5)' : 'Primary'}
            </button>
            <button
              onClick={() => {
                setSelectedStage('middle');
                setSelectedClassId('all');
              }}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedStage === 'middle'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'நடுநிலை (6-8)' : 'Middle'}
            </button>
            <button
              onClick={() => {
                setSelectedStage('high');
                setSelectedClassId('all');
              }}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedStage === 'high'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'உயர்நிலை (9-10)' : 'High'}
            </button>
            <button
              onClick={() => {
                setSelectedStage('higher-secondary');
                setSelectedClassId('all');
              }}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedStage === 'higher-secondary'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'மேல்நிலை (11-12)' : 'Hr Sec'}
            </button>
          </div>

          {/* Class Select Dropdown */}
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
          >
            <option value="all">{isTa ? 'அனைத்து வகுப்புகள்' : 'All Classes (Balance Sheet)'}</option>
            {filteredByStage.map(cls => (
              <option key={cls.id} value={cls.id}>
                {isTa ? cls.nameTamil || cls.name : cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Render tables for each class */}
      <div className="space-y-10">
        {classesToRender.map(cls => {
          const classReqs = requirements.filter(r => r.classId === cls.id);
          const periodsPerDay = cls.periodsPerDay || 8;
          const weeklyTargetPeriods = periodsPerDay * config.days.length; // 40

          // Compute daily totals
          const dayTotals: Record<DayOfWeek, number> = {
            Monday: 0,
            Tuesday: 0,
            Wednesday: 0,
            Thursday: 0,
            Friday: 0,
            Saturday: 0,
          };

          let grandTotalAssigned = 0;
          let grandTotalAllotted = 0;

          classReqs.forEach(req => {
            grandTotalAssigned += req.assignedPerWeek;
            config.days.forEach(d => {
              const val = req.dailyDistribution[d] || 0;
              dayTotals[d] += val;
              grandTotalAllotted += val;
            });
          });

          const grandTotalDiff = grandTotalAllotted - grandTotalAssigned;
          const isClassBalanced =
            grandTotalDiff === 0 &&
            grandTotalAllotted === weeklyTargetPeriods &&
            config.days.every(d => dayTotals[d] === periodsPerDay);

          return (
            <div
              key={cls.id}
              className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden break-inside-avoid"
            >
              {/* Institutional Header Banner */}
              <div className="bg-[#1e3a8a] text-white py-2 px-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold tracking-wide uppercase text-sm font-sans flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-300" />
                    <span>{isTa ? cls.nameTamil || cls.name : cls.name} · {isTa ? 'பாட ஒதுக்கீட்டு விவரங்கள்' : 'PERIOD ALLOTMENT'}</span>
                  </h3>
                  <div className="text-[11px] text-blue-200">
                    {config.schoolName} · {isTa ? `இலக்கு: ${periodsPerDay} வேளைகள்/நாள் (40 வேளைகள்/வாரம்)` : `Target: ${periodsPerDay} Periods/Day (40 Periods/Week)`}
                  </div>
                </div>

                <div className="flex items-center gap-2 no-print">
                  <button
                    onClick={() => onAutoBalanceClass(cls.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-blue-700 hover:bg-blue-600 text-white transition-colors"
                    title="Evenly distribute weekly assigned periods across Monday to Friday"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{isTa ? 'நாட்களை சமன்செய்' : 'Auto-Distribute Days'}</span>
                  </button>

                  {isClassBalanced ? (
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isTa ? 'சரியாக சமநிலை (40)' : 'Balanced (40/40)'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isTa ? 'சரிசெய்க' : 'Adjustment Needed'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* No. Of Periods row matching PDF:
                  "No. Of Periods | 8 | 8 | 8 | 8 | 8 | 40"
              */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#1e40af] text-white divide-x divide-blue-500 font-sans">
                      <th className="py-2 px-3 text-left font-bold uppercase tracking-wider w-52">
                        {isTa ? 'பாடவேளை எண்ணிக்கை' : 'No. Of Periods'}
                      </th>
                      <th className="py-2 px-2 text-center font-bold w-24">
                        {isTa ? 'வாரம்' : 'Per Week'}
                      </th>
                      {config.days.map(d => (
                        <th key={d} className="py-2 px-2 text-center font-bold w-20">
                          {periodsPerDay}
                        </th>
                      ))}
                      <th className="py-2 px-2 text-center font-bold bg-[#15803d] text-white w-20">
                        {weeklyTargetPeriods}
                      </th>
                      <th className="py-2 px-2 text-center font-bold w-20 bg-blue-950">
                        {isTa ? 'வித்தியாசம்' : 'Diff'}
                      </th>
                    </tr>

                    <tr className="bg-[#2563eb] text-white divide-x divide-blue-400 font-sans">
                      <th className="py-2 px-3 text-left font-bold uppercase tracking-wider">
                        {isTa ? 'பாடம்' : 'Subject'}
                      </th>
                      <th className="py-2 px-2 text-center font-bold uppercase tracking-wider">
                        {isTa ? 'ஒதுக்கப்பட்ட வேளைகள்' : 'Periods Assigned'}
                      </th>
                      {config.days.map(d => (
                        <th key={d} className="py-2 px-2 text-center font-bold uppercase tracking-wider">
                          {isTa ? dayNamesTamil[d] : d}
                        </th>
                      ))}
                      <th className="py-2 px-2 text-center font-bold uppercase tracking-wider">
                        {isTa ? 'மொத்தம்' : 'Total'}
                      </th>
                      <th className="py-2 px-2 text-center font-bold uppercase tracking-wider">
                        {isTa ? 'வித்தியாசம்' : 'Difference'}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 font-sans">
                    {classReqs.map(req => {
                      const subject = subjectMap.get(req.subjectId);
                      if (!subject) return null;

                      // Calculate row total
                      const rowTotal = config.days.reduce(
                        (acc, d) => acc + (req.dailyDistribution[d] || 0),
                        0
                      );
                      const rowDiff = rowTotal - req.assignedPerWeek;
                      const subjectDisplayName = isTa && subject.tamilName ? subject.tamilName : subject.name;

                      return (
                        <tr
                          key={req.subjectId}
                          className="divide-x divide-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          {/* Subject Name */}
                          <td className="py-2 px-3 font-semibold text-slate-900 bg-slate-50/50">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-xs shrink-0"
                                style={{ backgroundColor: subject.color }}
                              />
                              <span className="truncate">{subjectDisplayName}</span>
                              {subject.isECA && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-medium">
                                  {isTa ? 'கலை/விளையாட்டு' : 'ECA'}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Periods assigned per week (Editable) */}
                          <td className="py-1 px-2 text-center bg-blue-50/30">
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={req.assignedPerWeek}
                              onChange={e =>
                                handleAssignedChange(req, parseInt(e.target.value) || 0)
                              }
                              className="w-14 text-center font-mono font-bold text-xs py-1 border border-slate-300 rounded focus:border-blue-600 focus:bg-white focus:outline-none"
                            />
                          </td>

                          {/* Days Mon - Fri (Editable) */}
                          {config.days.map(d => {
                            const val = req.dailyDistribution[d] || 0;
                            return (
                              <td key={d} className="py-1 px-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="5"
                                  value={val}
                                  onChange={e =>
                                    handleDistributionChange(req, d, parseInt(e.target.value) || 0)
                                  }
                                  className={`w-12 text-center font-mono text-xs py-1 border rounded focus:border-blue-600 focus:bg-white focus:outline-none ${
                                    val > 0
                                      ? 'font-bold text-slate-800 bg-white border-slate-300'
                                      : 'text-slate-400 bg-slate-50 border-slate-200'
                                  }`}
                                />
                              </td>
                            );
                          })}

                          {/* Row Total */}
                          <td className="py-2 px-2 text-center font-mono font-bold text-slate-800 bg-slate-100">
                            {rowTotal}
                          </td>

                          {/* Row Difference (Total - Assigned) */}
                          <td
                            className={`py-2 px-2 text-center font-mono font-bold ${
                              rowDiff === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : rowDiff > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {rowDiff > 0 ? `+${rowDiff}` : rowDiff}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Total Row */}
                    <tr className="bg-[#1e40af] text-white font-bold divide-x divide-blue-500 font-sans border-t-2 border-blue-900">
                      <td className="py-2.5 px-3 uppercase tracking-wider">
                        {isTa ? 'மொத்தம் (Total)' : 'Total'}
                      </td>
                      <td className="py-2 px-2 text-center font-mono bg-[#15803d] text-white">
                        {grandTotalAssigned}
                      </td>
                      {config.days.map(d => {
                        const totalForDay = dayTotals[d];
                        const isDayMatched = totalForDay === periodsPerDay;
                        return (
                          <td
                            key={d}
                            className={`py-2 px-2 text-center font-mono ${
                              isDayMatched ? 'bg-blue-900 text-white' : 'bg-amber-600 text-white'
                            }`}
                          >
                            {totalForDay}
                          </td>
                        );
                      })}
                      <td className="py-2 px-2 text-center font-mono bg-[#15803d] text-white">
                        {grandTotalAllotted}
                      </td>
                      <td
                        className={`py-2 px-2 text-center font-mono ${
                          grandTotalDiff === 0 ? 'bg-[#15803d] text-white' : 'bg-rose-700 text-white'
                        }`}
                      >
                        {grandTotalDiff > 0 ? `+${grandTotalDiff}` : grandTotalDiff}
                      </td>
                    </tr>

                    {/* Difference Row */}
                    <tr className="bg-[#1e3a8a] text-white font-bold divide-x divide-blue-700 font-sans">
                      <td className="py-2 px-3 uppercase tracking-wider text-blue-200">
                        {isTa ? 'வித்தியாசம் (Difference)' : 'Difference'}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-blue-300">
                        -
                      </td>
                      {config.days.map(d => {
                        const dayDiff = dayTotals[d] - periodsPerDay;
                        return (
                          <td
                            key={d}
                            className={`py-2 px-2 text-center font-mono text-xs ${
                              dayDiff === 0
                                ? 'text-emerald-300 bg-emerald-950/40'
                                : dayDiff < 0
                                ? 'text-rose-300 bg-rose-950/40'
                                : 'text-amber-300 bg-amber-950/40'
                            }`}
                          >
                            {dayDiff > 0 ? `+${dayDiff}` : dayDiff}
                          </td>
                        );
                      })}
                      <td className="py-2 px-2 text-center font-mono text-blue-200">
                        {grandTotalAllotted - weeklyTargetPeriods}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-emerald-300">
                        {grandTotalDiff}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
