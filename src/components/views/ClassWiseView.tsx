import React, { useState } from 'react';
import {
  TimetableSlot,
  ClassSection,
  Teacher,
  Subject,
  DayOfWeek,
  SchoolConfig,
  AcademicStage,
} from '../../types/timetable';
import { Printer, Clock } from 'lucide-react';
import { LanguageMode } from '../Header';

interface ClassWiseViewProps {
  config: SchoolConfig;
  slots: TimetableSlot[];
  classes: ClassSection[];
  teachers: Teacher[];
  subjects: Subject[];
  languageMode: LanguageMode;
  onSelectSlot: (classId: string, day: DayOfWeek, period: number) => void;
}

export const ClassWiseView: React.FC<ClassWiseViewProps> = ({
  config,
  slots,
  classes,
  teachers,
  subjects,
  languageMode,
  onSelectSlot,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [showTeacherNames, setShowTeacherNames] = useState<boolean>(true);
  const [showPrimaryBlockFormat, setShowPrimaryBlockFormat] = useState<boolean>(false);

  const isTa = languageMode === 'ta';
  const isBi = languageMode === 'bilingual';

  const teacherMap = new Map<string, Teacher>(teachers.map(t => [t.id, t]));
  const subjectMap = new Map<string, Subject>(subjects.map(s => [s.id, s]));

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

  const classesToDisplay =
    selectedClassId === 'all'
      ? filteredByStage
      : filteredByStage.filter(c => c.id === selectedClassId);

  // Roman numeral representation for periods
  const romanPeriods = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

  return (
    <div className="space-y-6">
      {/* View Header & Format Toggles */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>
              {isTa
                ? 'வகுப்பு வாரியான கால அட்டவணை (1 முதல் 12 வரை)'
                : 'CLASS WISE TIME TABLE (CLASSES 1 TO 12)'}
            </span>
            <span className="text-xs font-normal text-slate-500">
              · {isTa ? 'அரசாணை நேர ஒதுக்கீடு' : 'Official Period & Bell Schedule'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isTa
              ? 'வகுப்பறை சுவர்கள் மற்றும் மாணவர் குறிப்பேடுகளுக்கான அச்சிடத் தயாரான வடிவம் (பாடவேளை I முதல் VIII வரை).'
              : 'Individual classroom schedules with official bell timings (09:30 - 16:10, 8 periods).'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Format Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setShowTeacherNames(true)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                showTeacherNames
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'ஆசிரியர் பெயருடன்' : 'With Teachers'}
            </button>
            <button
              onClick={() => setShowTeacherNames(false)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                !showTeacherNames
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isTa ? 'பாடம் மட்டும்' : 'Subject Only'}
            </button>
          </div>

          {/* Primary 90m block view toggle */}
          <button
            onClick={() => setShowPrimaryBlockFormat(!showPrimaryBlockFormat)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showPrimaryBlockFormat
                ? 'bg-indigo-900 text-white border-indigo-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="Toggle between standard 8-period view and Primary 90-min block timetable (Page 4)"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isTa ? 'தொடக்கப்பள்ளி 90நிமி காலமுறை' : 'Primary 90m Blocks'}</span>
          </button>

          {/* Stage Filter */}
          <select
            value={selectedStage}
            onChange={e => {
              setSelectedStage(e.target.value);
              setSelectedClassId('all');
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
          >
            <option value="all">{isTa ? 'அனைத்து நிலைகள்' : 'All Stages'}</option>
            <option value="primary">{isTa ? 'தொடக்க (1-5)' : 'Primary (1-5)'}</option>
            <option value="middle">{isTa ? 'நடுநிலை (6-8)' : 'Middle (6-8)'}</option>
            <option value="high">{isTa ? 'உயர்நிலை (9-10)' : 'High (9-10)'}</option>
            <option value="higher-secondary">{isTa ? 'மேல்நிலை (11-12)' : 'Hr Sec (11-12)'}</option>
          </select>

          {/* Class Selector */}
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white max-w-[180px]"
          >
            <option value="all">{isTa ? 'அனைத்து வகுப்புகள்' : 'All Classes (Full Stack)'}</option>
            {filteredByStage.map(cls => (
              <option key={cls.id} value={cls.id}>
                {isTa ? cls.nameTamil || cls.name : cls.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isTa ? 'அச்சிடுக' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* Render Table for each selected class */}
      <div className="space-y-8">
        {classesToDisplay.map(cls => {
          const maxP = cls.periodsPerDay || 8;
          const classSlots = slots.filter(s => s.classId === cls.id);
          const isPrimary = cls.stage === 'primary';

          return (
            <div
              key={cls.id}
              className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden break-inside-avoid print:shadow-none print:border-black"
            >
              {/* Header Banner matching official Government order */}
              <div className="bg-[#1e3a8a] text-white py-2 px-4 flex items-center justify-between">
                <div>
                  <div className="font-bold tracking-wide uppercase text-sm font-sans">
                    {isTa ? 'வகுப்பு வாரியான கால அட்டவணை' : 'CLASS WISE TIME TABLE'}
                  </div>
                  <div className="text-[11px] text-blue-200">
                    {isTa ? config.schoolNameTamil || config.schoolName : config.schoolName} · {isTa ? cls.nameTamil || cls.name : cls.name} ({cls.roomNumber})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs bg-blue-800/80 px-2.5 py-0.5 rounded text-blue-100 font-semibold">
                    {cls.periodsPerDay} {isTa ? 'பாடவேளைகள் / நாள்' : 'Periods/Day'} · 40 {isTa ? 'வேளைகள் / வாரம்' : 'Periods/Wk'}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-medium mt-0.5">
                    {isTa ? 'விளையாட்டு / கலை ஒதுக்கீடு சேர்க்கப்பட்டுள்ளது' : 'Includes Daily Sports & ECA'}
                  </div>
                </div>
              </div>

              {/* Primary 90m block view banner if enabled for primary classes */}
              {isPrimary && showPrimaryBlockFormat && (
                <div className="bg-amber-50 border-b border-amber-200 p-2.5 text-xs text-amber-900 flex items-center justify-between">
                  <span className="font-medium">
                    {isTa ? 'தொடக்கப்பள்ளி நேர அமைப்பு (பக்கம் 4): 3 நீட்டிக்கப்பட்ட 90 நிமிட பாடவேளைகள் + நூலகம் (25 நிமி) + 1 மாலை வேளை (45 நிமி)' : 'Primary Block Timing (Page 4): Three 90-min blocks + Library (25m) + 1 evening period (45m)'}
                  </span>
                  <span className="font-mono text-[11px] font-bold bg-amber-200/70 px-2 py-0.5 rounded">
                    09:30 - 16:10
                  </span>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#2563eb] text-white divide-x divide-blue-400">
                      <th className="py-2 px-3 text-center font-semibold uppercase tracking-wider w-36">
                        {isTa ? 'பாடவேளை & நேரம்' : 'Period & Timing'}
                      </th>
                      {config.days.map(day => (
                        <th
                          key={day}
                          className="py-2 px-3 text-center font-semibold uppercase tracking-wider"
                        >
                          {isTa ? dayNamesTamil[day] : day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-sans">
                    {Array.from({ length: maxP }).map((_, idx) => {
                      const periodNum = idx + 1;
                      const timing = config.periodTimings.find(t => t.period === periodNum);
                      const roman = romanPeriods[idx] || String(periodNum);

                      return (
                        <React.Fragment key={`${cls.id}-row-${periodNum}`}>
                          <tr className="divide-x divide-slate-200 hover:bg-slate-50/70 transition-colors">
                            {/* Period Number and Time */}
                            <td className="py-2.5 px-3 text-center font-bold text-slate-800 bg-slate-50 whitespace-nowrap">
                              <span className="font-mono text-sm text-blue-900 font-bold">
                                {isTa ? `பாடவேளை ${roman}` : `Period ${roman}`}
                              </span>
                              {timing && (
                                <div className="text-[10px] text-slate-500 font-mono font-normal">
                                  {timing.startTime} - {timing.endTime}
                                </div>
                              )}
                            </td>

                            {/* Day Columns */}
                            {config.days.map(day => {
                              const slot = classSlots.find(
                                s => s.day === day && s.period === periodNum
                              );

                              const teacher = slot?.teacherId ? teacherMap.get(slot.teacherId) : null;
                              const subject = slot?.subjectId ? subjectMap.get(slot.subjectId) : null;

                              const subjectDisplayName = isTa && subject?.tamilName ? subject.tamilName : subject?.name || '';
                              const teacherDisplayName = isTa && teacher?.nameTamil ? teacher.code : teacher?.code || '';

                              return (
                                <td
                                  key={`${cls.id}-${day}-${periodNum}`}
                                  onClick={() => onSelectSlot(cls.id, day, periodNum)}
                                  className={`py-2 px-3 text-center cursor-pointer select-none transition-all ${
                                    slot
                                      ? subject?.isECA
                                        ? 'bg-amber-50/70 hover:bg-amber-100 text-slate-900'
                                        : 'bg-blue-50/40 hover:bg-blue-100 text-slate-900'
                                      : 'bg-white hover:bg-blue-50 text-slate-300'
                                  }`}
                                  title="Click to edit or reassign"
                                >
                                  {slot && subject ? (
                                    showTeacherNames ? (
                                      <div className="font-medium text-xs text-slate-900">
                                        <div className="font-mono font-bold text-blue-800 text-[11px] flex items-center justify-center gap-1">
                                          <span>{teacher ? teacherDisplayName : 'T-?'}</span>
                                          {slot.isCombined && (
                                            <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-100 text-indigo-800 font-semibold font-sans">
                                              {slot.combinedLabel || 'Joint'}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-slate-900 font-medium">
                                          {subjectDisplayName}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="font-semibold text-xs text-slate-900">
                                        <div>{subjectDisplayName}</div>
                                        {slot.isCombined && (
                                          <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-100 text-indigo-800 font-semibold font-mono">
                                            {slot.combinedLabel || 'Joint'}
                                          </span>
                                        )}
                                      </div>
                                    )
                                  ) : (
                                    <span className="text-slate-300 italic text-[11px]">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>

                          {/* Render Break Row if applicable matching Page 3 & Page 4 */}
                          {timing?.isBreakAfter && (
                            <tr className="bg-slate-100/90 text-slate-600 font-semibold text-center border-y border-slate-200">
                              <td colSpan={config.days.length + 1} className="py-1 text-[11px] tracking-wide">
                                🔔 {isTa ? timing.breakLabelTamil || timing.breakLabel : timing.breakLabel}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Class Teacher footer note */}
              <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
                <div>
                  <span className="font-semibold text-slate-700">
                    {isTa ? 'வகுப்பு ஆசிரியர்:' : 'Class Teacher:'}{' '}
                  </span>
                  {cls.classTeacherId ? (
                    <span className="text-blue-900 font-medium">
                      {isTa
                        ? teacherMap.get(cls.classTeacherId)?.nameTamil || teacherMap.get(cls.classTeacherId)?.name
                        : teacherMap.get(cls.classTeacherId)?.name}
                    </span>
                  ) : (
                    'Not Assigned'
                  )}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">{isTa ? 'அறை எண்:' : 'Room:'} </span>
                  {cls.roomNumber}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
