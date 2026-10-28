import React, { useState, useEffect } from 'react';
import {
  Teacher,
  TimetableSlot,
  ClassSection,
  Subject,
  DayOfWeek,
  SchoolConfig,
} from '../../types/timetable';
import {
  X,
  Check,
  Trash2,
  Plus,
  AlertCircle,
  Calendar,
  ArrowRightLeft,
  UserCheck,
  Sparkles,
  User,
  Sliders,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { LanguageMode } from '../Header';

interface EditTeacherFreePeriodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  teachers: Teacher[];
  initialDay?: DayOfWeek;
  config: SchoolConfig;
  slots: TimetableSlot[];
  classes: ClassSection[];
  subjects: Subject[];
  languageMode: LanguageMode;
  onUpdateSlots: (updatedSlots: TimetableSlot[]) => void;
  onUpdateTeacher?: (teacher: Teacher) => void;
}

export const EditTeacherFreePeriodsModal: React.FC<EditTeacherFreePeriodsModalProps> = ({
  isOpen,
  onClose,
  teacher,
  teachers,
  initialDay = 'Monday',
  config,
  slots,
  classes,
  subjects,
  languageMode,
  onUpdateSlots,
  onUpdateTeacher,
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teacher?.id || '');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(initialDay);
  const [activeSubTab, setActiveSubTab] = useState<'day' | 'week' | 'profile'>('day');

  // Assign form state
  const [assigningPeriod, setAssigningPeriod] = useState<number | null>(null);
  const [newClassId, setNewClassId] = useState<string>(classes[0]?.id || '');
  const [newSubjectId, setNewSubjectId] = useState<string>(subjects[0]?.id || '');

  // Swap state
  const [swapP1, setSwapP1] = useState<number>(1);
  const [swapP2, setSwapP2] = useState<number>(2);

  // Direct free periods input string state
  const [customFreeInput, setCustomFreeInput] = useState<string>('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Sync state if teacher changes
  useEffect(() => {
    if (teacher) {
      setSelectedTeacherId(teacher.id);
    }
  }, [teacher]);

  useEffect(() => {
    setSelectedDay(initialDay);
  }, [initialDay]);

  if (!isOpen) return null;

  const currentTeacher = teachers.find(t => t.id === selectedTeacherId) || teacher;
  if (!currentTeacher) return null;

  const isTa = languageMode === 'ta';

  const dayNamesTamil: Record<DayOfWeek, string> = {
    Monday: 'திங்கள்',
    Tuesday: 'செவ்வாய்',
    Wednesday: 'புதன்',
    Thursday: 'வியாழன்',
    Friday: 'வெள்ளி',
    Saturday: 'சனி',
  };

  const classMap = new Map<string, ClassSection>(classes.map(c => [c.id, c]));
  const subjectMap = new Map<string, Subject>(subjects.map(s => [s.id, s]));

  const maxPeriods = config.defaultPeriodsPerDay || 8;

  // Teacher's slots for current day
  const teacherDaySlots = slots.filter(
    s => s.teacherId === currentTeacher.id && s.day === selectedDay
  );

  // Total weekly load
  const totalWeeklyAssigned = slots.filter(s => s.teacherId === currentTeacher.id).length;
  const totalPossible = maxPeriods * config.days.length;
  const totalWeeklyFree = totalPossible - totalWeeklyAssigned;

  // Calculate free periods on current day
  const freePeriodsList: number[] = [];
  for (let p = 1; p <= maxPeriods; p++) {
    if (!teacherDaySlots.some(s => s.period === p)) {
      freePeriodsList.push(p);
    }
  }

  const showNotification = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast(null);
    }, 2500);
  };

  // Handle Make Period Free (Removes slot or teacher from slot)
  const handleMakePeriodFree = (period: number) => {
    const updated = slots.filter(
      s => !(s.teacherId === currentTeacher.id && s.day === selectedDay && s.period === period)
    );
    onUpdateSlots(updated);
    showNotification(isTa ? `பாடவேளை ${period} ஓய்வு வேளையாக மாற்றப்பட்டது` : `Period ${period} is now marked Free`);
  };

  // Handle Assign Teacher to a Class Period
  const handleAssignToClass = (period: number) => {
    const existingClassSlot = slots.find(
      s => s.classId === newClassId && s.day === selectedDay && s.period === period
    );

    let updated: TimetableSlot[];
    if (existingClassSlot) {
      updated = slots.map(s => {
        if (s.id === existingClassSlot.id) {
          return {
            ...s,
            teacherId: currentTeacher.id,
            subjectId: newSubjectId,
          };
        }
        return s;
      });
    } else {
      const newSlot: TimetableSlot = {
        id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        classId: newClassId,
        day: selectedDay,
        period,
        subjectId: newSubjectId,
        teacherId: currentTeacher.id,
      };
      updated = [...slots, newSlot];
    }

    onUpdateSlots(updated);
    setAssigningPeriod(null);
    showNotification(isTa ? `பாடவேளை ${period} கற்பித்தல் வேளையாக ஒதுக்கப்பட்டது` : `Period ${period} assigned to class`);
  };

  // Handle Direct Free Periods by Numbers string (e.g. "1, 3, 5, 8")
  const handleApplyCustomFreeNumbers = () => {
    const nums = customFreeInput
      .split(/[,\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n >= 1 && n <= maxPeriods);

    if (nums.length === 0 && customFreeInput.trim() !== '') {
      alert(isTa ? 'தயவுசெய்து சரியான பாடவேளை எண்களை உள்ளிடவும் (எ.கா: 1, 3, 5)' : 'Please enter valid period numbers (e.g., 1, 3, 5)');
      return;
    }

    // Free periods should not have any slots for this teacher on selectedDay
    const updated = slots.filter(s => {
      if (s.teacherId === currentTeacher.id && s.day === selectedDay) {
        // If this period is in free list, remove it
        return !nums.includes(s.period);
      }
      return true;
    });

    onUpdateSlots(updated);
    setCustomFreeInput('');
    showNotification(
      isTa
        ? `${dayNamesTamil[selectedDay]} ஓய்வு வேளைகள் (${nums.join(', ')}) சேமிக்கப்பட்டது!`
        : `Free periods (${nums.join(', ')}) saved for ${selectedDay}!`
    );
  };

  // Quick 1-click toggle between free and busy
  const handleTogglePeriodFree = (period: number) => {
    const isCurrentlyFree = !teacherDaySlots.some(s => s.period === period);
    if (isCurrentlyFree) {
      // Find a reasonable default class and subject
      const defaultClassId = classes[0]?.id || 'cls-1';
      const defaultSubjectId = currentTeacher.preferredSubjects?.[0] || subjects[0]?.id || 'sub-tam';
      
      const newSlot: TimetableSlot = {
        id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        classId: defaultClassId,
        day: selectedDay,
        period,
        subjectId: defaultSubjectId,
        teacherId: currentTeacher.id,
      };
      onUpdateSlots([...slots, newSlot]);
      showNotification(isTa ? `பாடவேளை ${period} வகுப்புடன் இணைக்கப்பட்டது` : `Period ${period} assigned`);
    } else {
      handleMakePeriodFree(period);
    }
  };

  // Handle Swap two periods for this teacher
  const handleSwapPeriods = () => {
    if (swapP1 === swapP2) return;

    const slot1 = slots.find(
      s => s.teacherId === currentTeacher.id && s.day === selectedDay && s.period === swapP1
    );
    const slot2 = slots.find(
      s => s.teacherId === currentTeacher.id && s.day === selectedDay && s.period === swapP2
    );

    const updated = slots.map(s => {
      if (slot1 && s.id === slot1.id) {
        return { ...s, period: swapP2 };
      }
      if (slot2 && s.id === slot2.id) {
        return { ...s, period: swapP1 };
      }
      return s;
    });

    onUpdateSlots(updated);
    showNotification(isTa ? `பாடவேளை ${swapP1} மற்றும் ${swapP2} இடமாற்றம் செய்யப்பட்டன` : `Swapped Period ${swapP1} and Period ${swapP2}`);
  };

  // Make whole day free (e.g. for leave/exam duty)
  const handleMakeAllDayFree = () => {
    if (window.confirm(isTa ? `${currentTeacher.code} - ${dayNamesTamil[selectedDay]} அன்று அனைத்து பாடவேளைகளையும் ஓய்வு வேளையாக்கவா?` : `Make all periods free for ${currentTeacher.code} on ${selectedDay}?`)) {
      const updated = slots.filter(
        s => !(s.teacherId === currentTeacher.id && s.day === selectedDay)
      );
      onUpdateSlots(updated);
      showNotification(isTa ? 'அனைத்து பாடவேளைகளும் ஓய்வாக்கப்பட்டன' : 'All periods set to free');
    }
  };

  // Check if chosen class in assigning modal already has another teacher
  const conflictingClassSlot = assigningPeriod
    ? slots.find(
        s =>
          s.classId === newClassId &&
          s.day === selectedDay &&
          s.period === assigningPeriod &&
          s.teacherId !== currentTeacher.id
      )
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Toast alert */}
        {saveToast && (
          <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 animate-in slide-in-from-top">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* Modal Top Header with Teacher Selector */}
        <div className="bg-[#1e3a8a] text-white p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700/80 border border-blue-400/30 flex items-center justify-center font-mono font-bold text-sm text-white">
              {currentTeacher.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide font-sans">
                  {isTa && currentTeacher.nameTamil ? currentTeacher.nameTamil : currentTeacher.name}
                </span>
                <span className="text-xs bg-blue-800 text-blue-200 px-2 py-0.5 rounded font-mono">
                  {currentTeacher.department}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-blue-200 mt-0.5 font-mono">
                <span>
                  {isTa ? 'கற்பித்தல்:' : 'Assigned:'}{' '}
                  <strong className="text-white">{totalWeeklyAssigned}</strong> / {currentTeacher.maxWeeklyLoad}
                </span>
                <span>·</span>
                <span>
                  {isTa ? 'ஓய்வு வேளைகள்:' : 'Weekly Free:'}{' '}
                  <strong className="text-emerald-300 font-bold">{totalWeeklyFree}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Teacher Switcher Dropdown */}
            <div className="flex items-center gap-1.5 bg-blue-950/60 px-2.5 py-1.5 rounded-lg border border-blue-700/50">
              <User className="w-3.5 h-3.5 text-blue-300" />
              <select
                value={selectedTeacherId}
                onChange={e => {
                  setSelectedTeacherId(e.target.value);
                  setAssigningPeriod(null);
                }}
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
                title="Switch Teacher to Edit"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id} className="text-slate-900 bg-white">
                    {t.code} - {isTa && t.nameTamil ? t.nameTamil : t.name} ({t.department})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal View Modes Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveSubTab('day')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'day'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isTa ? 'தினசரி திருத்தம்' : 'Day-wise Editor'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('week')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'week'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isTa ? 'முழு வார மேட்ரிக்ஸ்' : '5-Day Week Matrix'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('profile')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'profile'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isTa ? 'ஆசிரியர் பணிச்சுமை' : 'Teacher Load Quota'}</span>
            </button>
          </div>

          {activeSubTab === 'day' && (
            <div className="flex items-center gap-1">
              {config.days.map(d => {
                const isActive = selectedDay === d;
                const countFreeOnDay = Array.from({ length: maxPeriods }).filter(
                  (_, idx) => !slots.some(s => s.teacherId === currentTeacher.id && s.day === d && s.period === idx + 1)
                ).length;

                return (
                  <button
                    key={d}
                    onClick={() => {
                      setSelectedDay(d);
                      setAssigningPeriod(null);
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                      isActive
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{isTa ? dayNamesTamil[d] : d}</span>
                    <span
                      className={`text-[10px] font-mono px-1 rounded-full ${
                        isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {countFreeOnDay}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          
          {/* TAB 1: DAY-WISE DETAILED EDITOR */}
          {activeSubTab === 'day' && (
            <div className="space-y-4">
              {/* Quick Direct Free Periods Number Bar */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-700" />
                    <span className="font-bold text-xs text-blue-950 uppercase tracking-wide">
                      {isTa
                        ? `${dayNamesTamil[selectedDay]} - விரைவு ஓய்வு வேளை எண்கள்`
                        : `${selectedDay} - Quick Free Period Numbers`}
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold text-blue-900 bg-white px-2.5 py-0.5 rounded-full border border-blue-300">
                    {isTa ? 'தற்போதைய ஓய்வு:' : 'Current Free:'}{' '}
                    {freePeriodsList.length > 0 ? freePeriodsList.join(', ') : (isTa ? 'இல்லை' : 'None')}
                  </div>
                </div>

                <div className="text-[11px] text-slate-600">
                  {isTa
                    ? 'கீழே உள்ள பாடவேளை பட்டன்களை அழுத்தி உடனடியாக ஓய்வு/வகுப்பு என மாற்றலாம் அல்லது எண்களை உள்ளிடலாம்:'
                    : 'Click any period badge to instantly toggle between Free & Assigned, or enter comma-separated numbers:'}
                </div>

                {/* 1-Click Toggle Badges for Periods 1 to 8 */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {Array.from({ length: maxPeriods }).map((_, idx) => {
                    const pNum = idx + 1;
                    const isFree = freePeriodsList.includes(pNum);
                    const slot = teacherDaySlots.find(s => s.period === pNum);
                    const cls = slot ? classMap.get(slot.classId) : null;

                    return (
                      <button
                        key={pNum}
                        type="button"
                        onClick={() => handleTogglePeriodFree(pNum)}
                        className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg border font-mono text-xs font-bold flex flex-col items-center justify-center transition-all ${
                          isFree
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-300/60'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                        }`}
                        title={isFree ? 'Free period - Click to assign' : `Assigned: ${cls?.name || 'Class'} - Click to make Free`}
                      >
                        <span className="text-xs">P{pNum}</span>
                        <span className="text-[10px] font-sans font-medium mt-0.5">
                          {isFree ? (isTa ? 'ஓய்வு ✓' : 'Free ✓') : (isTa ? 'வகுப்பு' : 'Busy')}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Direct Number Input */}
                <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-blue-200">
                  <span className="text-[11px] font-semibold text-slate-700">
                    {isTa ? 'எண்கள் உள்ளிடுக (எ.கா: 1, 3, 5):' : 'Enter Free Periods (e.g. 1, 4, 7):'}
                  </span>
                  <input
                    type="text"
                    value={customFreeInput}
                    onChange={e => setCustomFreeInput(e.target.value)}
                    placeholder={freePeriodsList.join(', ')}
                    className="flex-1 min-w-[140px] px-2.5 py-1 text-xs bg-white border border-blue-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomFreeNumbers}
                    className="px-3 py-1 bg-blue-900 text-white font-semibold text-xs rounded-lg hover:bg-blue-800 transition-colors shadow-2xs"
                  >
                    {isTa ? 'அமைத்திடு' : 'Apply'}
                  </button>
                  <button
                    type="button"
                    onClick={handleMakeAllDayFree}
                    className="px-2.5 py-1 text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors text-xs font-medium"
                    title="Make all 8 periods free on this day"
                  >
                    {isTa ? 'முழு நாளும் ஓய்வு' : 'All Free Today'}
                  </button>
                </div>
              </div>

              {/* Detailed Period-by-Period List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>
                    {isTa
                      ? `${dayNamesTamil[selectedDay]} - பாடவேளை வாரியான விரிவான விவரங்கள்`
                      : `${selectedDay} - Detailed Period Assignments`}
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {isTa ? '8 பாடவேளை அமைப்பு' : '8-Period Structure'}
                  </span>
                </div>

                {Array.from({ length: maxPeriods }).map((_, idx) => {
                  const periodNum = idx + 1;
                  const timing = config.periodTimings.find(t => t.period === periodNum);
                  const slot = teacherDaySlots.find(s => s.period === periodNum);
                  const isFree = !slot;

                  const cls = slot ? classMap.get(slot.classId) : null;
                  const sub = slot ? subjectMap.get(slot.subjectId) : null;
                  const isCurrentlyAssigning = assigningPeriod === periodNum;

                  return (
                    <div
                      key={periodNum}
                      className={`p-3 rounded-xl border transition-all ${
                        isFree
                          ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                          : 'bg-white border-slate-200 hover:border-blue-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Period & Timing */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                              isFree
                                ? 'bg-emerald-600 text-white'
                                : 'bg-blue-900 text-white'
                            }`}
                          >
                            P{periodNum}
                          </div>

                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                              <span>
                                {isTa ? `பாடவேளை ${periodNum}` : `Period ${periodNum}`}
                              </span>
                              {timing && (
                                <span className="text-[11px] font-normal text-slate-500 font-mono">
                                  ({timing.startTime} - {timing.endTime})
                                </span>
                              )}
                            </div>

                            {slot ? (
                              <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
                                <span className="font-semibold text-blue-900">
                                  {isTa && cls?.nameTamil ? cls.nameTamil : cls?.name}
                                </span>
                                <span>·</span>
                                <span className="font-medium text-slate-800">
                                  {isTa && sub?.tamilName ? sub.tamilName : sub?.name}
                                </span>
                                <span className="text-slate-400">({cls?.roomNumber})</span>
                              </div>
                            ) : (
                              <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>{isTa ? 'ஓய்வு வேளை (Free Period)' : 'FREE PERIOD (No class assigned)'}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions for this period */}
                        <div className="flex items-center gap-2">
                          {slot ? (
                            <button
                              type="button"
                              onClick={() => handleMakePeriodFree(periodNum)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 transition-colors"
                              title="Free up this period"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{isTa ? 'ஓய்வு வேளையாக்குக' : 'Make Free'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAssigningPeriod(isCurrentlyAssigning ? null : periodNum)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-300 transition-colors"
                              title="Assign this teacher to a class in this period"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{isTa ? 'வகுப்பு ஒதுக்க' : 'Assign Class'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Inline Class Assignment Form */}
                      {isCurrentlyAssigning && (
                        <div className="mt-3 pt-3 border-t border-emerald-200 bg-white p-3 rounded-lg border space-y-3">
                          <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                            <span>
                              {isTa
                                ? `பாடவேளை ${periodNum} - வகுப்பு மற்றும் பாடம் தேர்வு`
                                : `Assign ${currentTeacher.code} to Period ${periodNum}`}
                            </span>
                            <button
                              onClick={() => setAssigningPeriod(null)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {conflictingClassSlot && (
                            <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span>
                                {isTa
                                  ? 'குறிப்பு: இந்த வகுப்பில் ஏற்கனவே மற்றொரு ஆசிரியர் கற்பிக்கிறார். இதை உறுதிசெய்தால் ஆசிரியர் மாற்றம் செய்யப்படும்.'
                                  : 'Note: This class currently has another teacher assigned in this period. Saving will update the assignment.'}
                              </span>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                {isTa ? 'வகுப்பு' : 'Class'}
                              </label>
                              <select
                                value={newClassId}
                                onChange={e => setNewClassId(e.target.value)}
                                className="w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-800 focus:bg-white focus:outline-none"
                              >
                                {classes.map(c => (
                                  <option key={c.id} value={c.id}>
                                    {isTa && c.nameTamil ? c.nameTamil : c.name} ({c.roomNumber})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                {isTa ? 'பாடம்' : 'Subject'}
                              </label>
                              <select
                                value={newSubjectId}
                                onChange={e => setNewSubjectId(e.target.value)}
                                className="w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-800 focus:bg-white focus:outline-none"
                              >
                                {subjects.map(s => (
                                  <option key={s.id} value={s.id}>
                                    {isTa && s.tamilName ? s.tamilName : s.name} ({s.code})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setAssigningPeriod(null)}
                              className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
                            >
                              {isTa ? 'ரத்து' : 'Cancel'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAssignToClass(periodNum)}
                              className="flex items-center gap-1 px-4 py-1 text-xs font-bold rounded bg-blue-900 text-white hover:bg-blue-800"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isTa ? 'உறுதிசெய்க' : 'Confirm Assignment'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick Period Swap tool */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-blue-700" />
                  <span>
                    {isTa
                      ? `${dayNamesTamil[selectedDay]} - பாடவேளைகளை இடமாற்றம் செய்க`
                      : `Swap Two Periods on ${selectedDay}`}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-xs">{isTa ? 'வேளை' : 'Period'}:</span>
                    <select
                      value={swapP1}
                      onChange={e => setSwapP1(Number(e.target.value))}
                      className="text-xs p-1 bg-white border border-slate-300 rounded font-mono"
                    >
                      {Array.from({ length: maxPeriods }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          P{i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span>↔</span>

                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-xs">{isTa ? 'வேளை' : 'Period'}:</span>
                    <select
                      value={swapP2}
                      onChange={e => setSwapP2(Number(e.target.value))}
                      className="text-xs p-1 bg-white border border-slate-300 rounded font-mono"
                    >
                      {Array.from({ length: maxPeriods }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          P{i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleSwapPeriods}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>{isTa ? 'இடமாற்று' : 'Swap'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FULL 5-DAY WEEK MATRIX */}
          {activeSubTab === 'week' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                    {isTa
                      ? `${currentTeacher.code} - முழு வார 5-நாள் அட்டவணை மேட்ரிக்ஸ்`
                      : `${currentTeacher.code} - Weekly Schedule Matrix (Mon - Fri)`}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isTa
                      ? 'எந்தவொரு கட்டத்தையும் கிளிக் செய்து ஓய்வு அல்லது கற்பித்தல் வேளையாக நேரடியாக மாற்றலாம்.'
                      : 'Click any cell to toggle directly between Free Period and Teaching assignment.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span>
                    {isTa ? 'ஓய்வு' : 'Free'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-blue-900 font-semibold">
                    <span className="w-2.5 h-2.5 rounded bg-blue-900"></span>
                    {isTa ? 'வகுப்பு' : 'Teaching'}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-2xs">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-blue-900 text-white divide-x divide-blue-800">
                      <th className="py-2 px-3 text-left font-bold w-24">
                        {isTa ? 'கிழமை' : 'Day'}
                      </th>
                      {Array.from({ length: maxPeriods }).map((_, idx) => (
                        <th key={idx + 1} className="py-2 px-2 text-center font-bold font-mono">
                          P{idx + 1}
                        </th>
                      ))}
                      <th className="py-2 px-2 text-center font-bold w-16">
                        {isTa ? 'ஓய்வு' : 'Free'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {config.days.map(d => {
                      const daySlots = slots.filter(
                        s => s.teacherId === currentTeacher.id && s.day === d
                      );
                      const freeCount = maxPeriods - daySlots.length;

                      return (
                        <tr key={d} className="divide-x divide-slate-200 hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-bold text-slate-800 bg-slate-50 whitespace-nowrap">
                            {isTa ? dayNamesTamil[d] : d}
                          </td>
                          {Array.from({ length: maxPeriods }).map((_, idx) => {
                            const pNum = idx + 1;
                            const slot = daySlots.find(s => s.period === pNum);
                            const isFree = !slot;
                            const cls = slot ? classMap.get(slot.classId) : null;
                            const sub = slot ? subjectMap.get(slot.subjectId) : null;

                            return (
                              <td
                                key={pNum}
                                onClick={() => {
                                  setSelectedDay(d);
                                  handleTogglePeriodFree(pNum);
                                }}
                                className={`py-2 px-1.5 text-center cursor-pointer select-none transition-colors ${
                                  isFree
                                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold'
                                    : 'bg-blue-50/60 text-blue-900 hover:bg-blue-100 font-medium'
                                }`}
                                title={
                                  isFree
                                    ? `Free Period on ${d} P${pNum} - Click to toggle`
                                    : `${cls?.name} (${sub?.name}) on ${d} P${pNum} - Click to make Free`
                                }
                              >
                                {isFree ? (
                                  <span className="font-mono text-emerald-700 font-bold">✓ Free</span>
                                ) : (
                                  <div className="leading-tight">
                                    <div className="font-bold text-[11px] truncate max-w-[70px] mx-auto">
                                      {cls?.name?.replace('Class ', 'C-')}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate max-w-[70px] mx-auto">
                                      {sub?.code || sub?.name?.slice(0, 5)}
                                    </div>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                          <td className="py-2 px-2 text-center font-mono font-bold text-emerald-700 bg-emerald-50/30">
                            {freeCount}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TEACHER INFORMATION & WORKLOAD QUOTA */}
          {activeSubTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-700" />
                  <span>{isTa ? 'ஆசிரியர் விவரம் & பணிச்சுமை அமைப்புகள்' : 'Teacher Profile & Workload Limits'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {isTa ? 'ஆசிரியர் குறியீடு (Code)' : 'Teacher Code'}
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentTeacher.code}
                      className="w-full text-xs p-2 bg-slate-200/70 border border-slate-300 rounded font-mono font-bold text-slate-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {isTa ? 'ஆசிரியர் பெயர் (ஆங்கிலம்)' : 'Teacher Name (English)'}
                    </label>
                    <input
                      type="text"
                      value={currentTeacher.name}
                      onChange={e => {
                        if (onUpdateTeacher) {
                          onUpdateTeacher({ ...currentTeacher, name: e.target.value });
                        }
                      }}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {isTa ? 'ஆசிரியர் பெயர் (தமிழ்)' : 'Teacher Name (Tamil)'}
                    </label>
                    <input
                      type="text"
                      value={currentTeacher.nameTamil || ''}
                      onChange={e => {
                        if (onUpdateTeacher) {
                          onUpdateTeacher({ ...currentTeacher, nameTamil: e.target.value });
                        }
                      }}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {isTa ? 'பாடம் / துறை' : 'Subject / Department'}
                    </label>
                    <input
                      type="text"
                      value={currentTeacher.department}
                      onChange={e => {
                        if (onUpdateTeacher) {
                          onUpdateTeacher({ ...currentTeacher, department: e.target.value });
                        }
                      }}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {isTa ? 'அதிகபட்ச வாராந்திர பணிச்சுமை' : 'Maximum Weekly Teaching Periods'}
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={40}
                      value={currentTeacher.maxWeeklyLoad}
                      onChange={e => {
                        if (onUpdateTeacher) {
                          onUpdateTeacher({
                            ...currentTeacher,
                            maxWeeklyLoad: parseInt(e.target.value, 10) || 28,
                          });
                        }
                      }}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* Meter */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>{isTa ? 'பணிச்சுமை பயன்பாடு:' : 'Workload Utilization:'}</span>
                    <span>
                      {totalWeeklyAssigned} / {currentTeacher.maxWeeklyLoad}{' '}
                      ({Math.round((totalWeeklyAssigned / currentTeacher.maxWeeklyLoad) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        totalWeeklyAssigned > currentTeacher.maxWeeklyLoad
                          ? 'bg-rose-600'
                          : totalWeeklyAssigned >= currentTeacher.maxWeeklyLoad - 2
                          ? 'bg-emerald-600'
                          : 'bg-blue-600'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (totalWeeklyAssigned / currentTeacher.maxWeeklyLoad) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {isTa ? 'மாற்றங்கள் நிகழ்நேரத்தில் அட்டவணையில் சேமிக்கப்படுகின்றன.' : 'All changes are automatically updated in the live timetable.'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-blue-900 hover:bg-blue-800 text-white shadow-xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isTa ? 'நிறைவுசெய்க' : 'Done & Close'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
