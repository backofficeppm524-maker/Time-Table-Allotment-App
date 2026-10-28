import React, { useState } from 'react';
import {
  TimetableSlot,
  ClassSection,
  Teacher,
  Subject,
  DayOfWeek,
  SchoolConfig,
} from '../../types/timetable';
import { X, Trash2, ArrowRightLeft, AlertCircle, Check } from 'lucide-react';
import { LanguageMode } from '../Header';

interface EditSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SchoolConfig;
  classId: string;
  day: DayOfWeek;
  period: number;
  classes: ClassSection[];
  teachers: Teacher[];
  subjects: Subject[];
  allSlots: TimetableSlot[];
  languageMode?: LanguageMode;
  onSaveSlot: (
    slot: Partial<TimetableSlot>,
    syncCombined?: boolean,
    targetClassIds?: string[]
  ) => void;
  onDeleteSlot: (
    classId: string,
    day: DayOfWeek,
    period: number,
    deleteEntireGroup?: boolean
  ) => void;
  onSwapSlots: (
    classId: string,
    day: DayOfWeek,
    period1: number,
    period2: number,
    swapEntireGroup?: boolean
  ) => void;
}

export const EditSlotModal: React.FC<EditSlotModalProps> = ({
  isOpen,
  onClose,
  config,
  classId,
  day,
  period,
  classes,
  teachers,
  subjects,
  allSlots,
  languageMode = 'en',
  onSaveSlot,
  onDeleteSlot,
  onSwapSlots,
}) => {
  if (!isOpen) return null;

  const isTa = languageMode === 'ta';

  const currentClass = classes.find(c => c.id === classId);
  const existingSlot = allSlots.find(
    s => s.classId === classId && s.day === day && s.period === period
  );

  // Find linked classes in combined group if this slot is combined
  const linkedClassIds = React.useMemo(() => {
    if (!existingSlot) return [classId];
    if (existingSlot.combinedClassIds && existingSlot.combinedClassIds.length > 0) {
      return Array.from(new Set([classId, ...existingSlot.combinedClassIds]));
    }
    if (existingSlot.combinedGroupId) {
      return Array.from(
        new Set(
          allSlots
            .filter(
              s =>
                s.day === day &&
                s.period === period &&
                s.combinedGroupId === existingSlot.combinedGroupId
            )
            .map(s => s.classId)
        )
      );
    }
    if (existingSlot.isCombined && existingSlot.teacherId) {
      return Array.from(
        new Set(
          allSlots
            .filter(
              s =>
                s.day === day &&
                s.period === period &&
                s.teacherId === existingSlot.teacherId
            )
            .map(s => s.classId)
        )
      );
    }
    return [classId];
  }, [existingSlot, allSlots, day, period, classId]);

  const isInitiallyCombined = linkedClassIds.length > 1;
  const [syncCombined, setSyncCombined] = useState<boolean>(true);
  const [selectedCombineClasses, setSelectedCombineClasses] = useState<string[]>(linkedClassIds);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    existingSlot?.subjectId || subjects[0]?.id || ''
  );
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    existingSlot?.teacherId || teachers[0]?.id || ''
  );
  const [selectedRoom, setSelectedRoom] = useState<string>(
    existingSlot?.room || currentClass?.roomNumber || ''
  );
  const [swapTargetPeriod, setSwapTargetPeriod] = useState<number>(
    period === 1 ? 2 : 1
  );

  const timing = config.periodTimings.find(t => t.period === period);

  // Check if selected teacher is busy elsewhere at this exact day & period (excluding intentional combined lectures)
  const conflictingSlot = allSlots.find(
    s =>
      s.day === day &&
      s.period === period &&
      s.teacherId === selectedTeacherId &&
      !linkedClassIds.includes(s.classId) &&
      !(s.isCombined && (existingSlot?.isCombined || s.subjectId === selectedSubjectId))
  );
  const conflictingClass = conflictingSlot
    ? classes.find(c => c.id === conflictingSlot.classId)
    : null;

  // Check if selected room is occupied elsewhere at this exact day & period
  const effectiveTargetRoom = selectedRoom.trim();
  const conflictingRoomSlot = effectiveTargetRoom
    ? allSlots.find(
        s =>
          s.day === day &&
          s.period === period &&
          !linkedClassIds.includes(s.classId) &&
          (s.room || classes.find(c => c.id === s.classId)?.roomNumber || '').trim().toLowerCase() === effectiveTargetRoom.toLowerCase() &&
          !(s.isCombined && (existingSlot?.isCombined || s.subjectId === selectedSubjectId))
      )
    : null;
  const conflictingRoomClass = conflictingRoomSlot
    ? classes.find(c => c.id === conflictingRoomSlot.classId)
    : null;

  const handleSave = () => {
    const finalClassIds = isInitiallyCombined
      ? (syncCombined ? linkedClassIds : [classId])
      : selectedCombineClasses;

    const isCombined = finalClassIds.length > 1;

    onSaveSlot(
      {
        id: existingSlot?.id || `slot-${Date.now()}`,
        classId,
        day,
        period,
        subjectId: selectedSubjectId,
        teacherId: selectedTeacherId,
        room: selectedRoom,
        isCombined,
        combinedLabel: existingSlot?.combinedLabel,
        combinedClassIds: isCombined ? finalClassIds : undefined,
        combinedGroupId: isCombined ? existingSlot?.combinedGroupId : undefined,
      },
      syncCombined,
      finalClassIds
    );
    onClose();
  };

  const handleDelete = () => {
    onDeleteSlot(classId, day, period, syncCombined && isInitiallyCombined);
    onClose();
  };

  const handleSwap = () => {
    if (swapTargetPeriod !== period) {
      onSwapSlots(classId, day, period, swapTargetPeriod, syncCombined && isInitiallyCombined);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#1e3a8a] text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm tracking-wide uppercase font-sans">
              {isTa ? 'பாடவேளை ஒதுக்கீடு திருத்தம்' : 'Edit Period Allotment'}
            </h3>
            <p className="text-xs text-blue-200 mt-0.5">
              {isTa && currentClass?.nameTamil ? currentClass.nameTamil : currentClass?.name} · {day} · Period {period}{' '}
              {timing && `(${timing.startTime} - ${timing.endTime})`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-blue-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* Combined Class Synchronization Banner */}
          {isInitiallyCombined && (
            <div className="p-3.5 bg-indigo-50/90 border-2 border-indigo-300 rounded-xl flex flex-col gap-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-900 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-wider shadow-2xs">
                    {isTa ? 'இணைக்கப்பட்ட வகுப்பு' : 'Combined Class Session'}
                  </span>
                  <span className="font-mono font-black text-indigo-950 text-xs sm:text-sm">
                    {existingSlot?.combinedLabel || linkedClassIds.map(id => classes.find(c => c.id === id)?.name || id).join(', ')}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">
                  {linkedClassIds.length} {isTa ? 'வகுப்புகள் இணைக்கப்பட்டுள்ளன' : 'Linked Sections'}
                </span>
              </div>
              <p className="text-[11px] text-indigo-900/90 leading-relaxed">
                {isTa
                  ? `இந்த வேளை ${linkedClassIds.map(id => classes.find(c => c.id === id)?.name || id).join(', ')} வகுப்புகளுக்கு ஒன்றாக கற்பிக்கப்படுகிறது.`
                  : `This period is shared simultaneously by: ${linkedClassIds.map(id => classes.find(c => c.id === id)?.name || id).join(', ')}.`}
              </p>
              <label className="flex items-center gap-2.5 text-xs font-bold text-indigo-950 bg-white p-2 rounded-lg border border-indigo-200 cursor-pointer select-none hover:bg-indigo-50/50 transition-colors">
                <input
                  type="checkbox"
                  checked={syncCombined}
                  onChange={e => setSyncCombined(e.target.checked)}
                  className="rounded text-indigo-900 focus:ring-indigo-600 w-4 h-4 cursor-pointer"
                />
                <span className="flex-1">
                  {isTa
                    ? `அனைத்து ${linkedClassIds.length} இணைக்கப்பட்ட வகுப்புகளிலும் (${linkedClassIds.map(id => classes.find(c => c.id === id)?.name || id).join(', ')}) இந்த மாற்றத்தை ஒரே நேரத்தில் சேமிக்கவும் (பரிந்துரைக்கப்படுகிறது)`
                    : `Sync changes across all ${linkedClassIds.length} linked sections (${linkedClassIds.map(id => classes.find(c => c.id === id)?.name || id).join(', ')}) (Recommended)`}
                </span>
              </label>
              {!syncCombined && (
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-300 font-medium">
                  ⚠️ {isTa
                    ? `இந்த வகுப்பு (${currentClass?.name}) மட்டும் தனி வகுப்பாகப் பிரிக்கப்படும். மற்ற வகுப்புகள் முந்தைய நிலையிலேயே இருக்கும்.`
                    : `This section (${currentClass?.name}) will be separated into an individual class. The other sections will retain their current assignment.`}
                </div>
              )}
            </div>
          )}

          {/* Conflict Alerts */}
          {conflictingSlot && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg flex items-start gap-2.5 text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{isTa ? '⚠️ ஆசிரியர் பணி மோதல் (Teacher Double-Booking):' : '⚠️ Teacher Double-Booking Conflict:'}</p>
                <p className="text-rose-700 mt-0.5">
                  {isTa
                    ? `இந்த ஆசிரியர் ஏற்கனவே ${conflictingClass?.nameTamil || conflictingClass?.name || 'மற்றொரு வகுப்பில்'} கற்பிக்க நியமிக்கப்பட்டுள்ளார்.`
                    : `This teacher is already scheduled to teach in ${conflictingClass?.name || 'another class'} during ${day} Period ${period}. Assigning them here will create a schedule collision!`}
                </p>
              </div>
            </div>
          )}

          {conflictingRoomSlot && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2.5 text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{isTa ? '⚠️ அறை/ஆய்வக முரண்பாடு (Room Collision):' : '⚠️ Room/Lab Collision Conflict:'}</p>
                <p className="text-amber-800 mt-0.5">
                  {isTa
                    ? `அறை/ஆய்வகம் "${effectiveTargetRoom}" ஏற்கனவே ${conflictingRoomClass?.nameTamil || conflictingRoomClass?.name || 'மற்றொரு வகுப்பால்'} பயன்படுத்தப்படுகிறது.`
                    : `Room/Lab "${effectiveTargetRoom}" is already occupied by ${conflictingRoomClass?.name || 'another class'} during ${day} Period ${period}.`}
                </p>
              </div>
            </div>
          )}

          {/* Subject Field */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              {isTa ? 'பாடம்' : 'Subject'}
            </label>
            <select
              value={selectedSubjectId}
              onChange={e => {
                const subId = e.target.value;
                setSelectedSubjectId(subId);
                const subObj = subjects.find(s => s.id === subId);
                if (subObj?.isPractical || subObj?.isLab) {
                  if (subObj.id === 'sub-phy' && !selectedRoom.includes('Physics')) setSelectedRoom('Physics Lab');
                  else if (subObj.id === 'sub-che' && !selectedRoom.includes('Chem')) setSelectedRoom('Chemistry Lab');
                  else if (subObj.id === 'sub-cs' && !selectedRoom.includes('Computer')) setSelectedRoom('Computer Lab');
                  else if ((subObj.id === 'sub-bio-bot' || subObj.id === 'sub-bot') && !selectedRoom.includes('Botany')) setSelectedRoom('Botany Lab');
                  else if ((subObj.id === 'sub-bio-zoo' || subObj.id === 'sub-zoo') && !selectedRoom.includes('Zoo')) setSelectedRoom('Zoology Lab');
                  else if (subObj.id === 'sub-agri-p' && !selectedRoom.includes('Agri')) setSelectedRoom('Agri Field/Lab');
                  else if (subObj.id === 'sub-pet' && !selectedRoom.includes('Ground')) setSelectedRoom('Playground');
                }

                // Auto-suggest matching teacher for this subject
                const currentT = teachers.find(t => t.id === selectedTeacherId);
                const currentHandles =
                  currentT?.subjectsHandled?.includes(subId) ||
                  currentT?.preferredSubjects?.includes(subId);

                if (!currentHandles) {
                  // Find suitable teacher
                  const matchingTeacher = teachers.find(
                    t =>
                      (t.subjectsHandled?.includes(subId) || t.preferredSubjects?.includes(subId)) &&
                      (currentClass?.stage === 'higher-secondary' ? t.department.toLowerCase().includes('pg') : true)
                  ) || teachers.find(
                    t => t.subjectsHandled?.includes(subId) || t.preferredSubjects?.includes(subId)
                  );
                  if (matchingTeacher) {
                    setSelectedTeacherId(matchingTeacher.id);
                  }
                }
              }}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {isTa && s.tamilName ? s.tamilName : s.name} ({s.code}) {s.isPractical ? (s.practicalGroup === 'science' ? '🧪 [Sci Lab]' : '🌾 [Voc Lab]') : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Room / Laboratory Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-800">
                {isTa ? 'அறை / ஆய்வகம்' : 'Classroom / Laboratory'}
              </label>
              <span className="text-[10px] text-slate-500">
                {isTa ? `வகுப்பறை இயல்பு: ${currentClass?.roomNumber}` : `Default: ${currentClass?.roomNumber}`}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedRoom}
                onChange={e => setSelectedRoom(e.target.value)}
                placeholder={currentClass?.roomNumber || 'Room 101'}
                className={`flex-1 text-xs border rounded-lg p-2.5 font-medium focus:outline-none focus:ring-1 ${
                  conflictingRoomSlot
                    ? 'border-amber-400 bg-amber-50/50 text-amber-950 focus:ring-amber-500'
                    : 'bg-slate-50 border-slate-300 text-slate-800 focus:bg-white focus:ring-blue-600'
                }`}
              />
              <select
                onChange={e => e.target.value && setSelectedRoom(e.target.value)}
                className="text-xs bg-slate-100 border border-slate-300 rounded-lg px-2 text-slate-700 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>{isTa ? 'ஆய்வகங்கள்...' : 'Presets...'}</option>
                <option value={currentClass?.roomNumber || 'Classroom'}>{currentClass?.roomNumber || 'Classroom'}</option>
                <option value="Physics Lab">Physics Lab</option>
                <option value="Chemistry Lab">Chemistry Lab</option>
                <option value="Computer Lab">Computer Lab</option>
                <option value="Botany Lab">Botany Lab</option>
                <option value="Zoology Lab">Zoology Lab</option>
                <option value="Agri Field/Lab">Agri Field/Lab</option>
                <option value="Language Lab">Language Lab</option>
                <option value="Playground">Playground</option>
              </select>
            </div>
          </div>

          {/* Teacher Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-800">
                {isTa ? 'ஒதுக்கப்படும் ஆசிரியர்' : 'Assigned Teacher'}
              </label>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-medium">
                {isTa ? 'ஒரு ஆசிரியர் பல பாடங்களை எடுக்கலாம்' : '1 Teacher can take multiple subjects'}
              </span>
            </div>
            <select
              value={selectedTeacherId}
              onChange={e => setSelectedTeacherId(e.target.value)}
              className={`w-full text-xs border rounded-lg p-2.5 font-medium focus:outline-none focus:ring-1 ${
                conflictingSlot
                  ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-rose-500'
                  : 'bg-slate-50 border-slate-300 text-slate-800 focus:bg-white focus:ring-blue-600'
              }`}
            >
              <option value="">-- {isTa ? 'ஆசிரியர் இல்லை' : 'No Teacher / Self Study'} --</option>
              {teachers.map(t => {
                const isBusy = allSlots.some(
                  s =>
                    s.day === day &&
                    s.period === period &&
                    s.teacherId === t.id &&
                    s.classId !== classId
                );
                const teacherName = isTa && t.nameTamil ? t.nameTamil : t.name;

                // Subjects handled by this teacher
                const handledSubIds = t.subjectsHandled || t.preferredSubjects || [];
                const handledSubNames = handledSubIds
                  .map(sid => {
                    const sub = subjects.find(s => s.id === sid);
                    return sub ? (isTa && sub.tamilName ? sub.tamilName : sub.name) : sid;
                  })
                  .filter(Boolean);

                const subjectsLabel = handledSubNames.length > 0
                  ? handledSubNames.join(', ')
                  : t.department;

                const isSubjectMatch = handledSubIds.includes(selectedSubjectId);

                return (
                  <option key={t.id} value={t.id}>
                    {t.code} - {teacherName} ({subjectsLabel}) {isSubjectMatch ? '⭐' : ''} {isBusy ? (isTa ? '⚠️ [வேலை உள்ளது]' : '⚠️ [BUSY]') : (isTa ? '✓ [ஓய்வு]' : '✓ [FREE]')}
                  </option>
                );
              })}
            </select>

            {/* Selected Teacher Multi-Subject Info Box */}
            {selectedTeacherId && (() => {
              const activeT = teachers.find(t => t.id === selectedTeacherId);
              if (!activeT) return null;
              const subIds = activeT.subjectsHandled || activeT.preferredSubjects || [];
              const handledSubs = subIds.map(sid => subjects.find(s => s.id === sid)).filter(Boolean) as Subject[];

              // Find other classes where this teacher teaches
              const teacherOtherClasses = Array.from(
                new Set(
                  allSlots
                    .filter(s => s.teacherId === activeT.id)
                    .map(s => {
                      const c = classes.find(cl => cl.id === s.classId);
                      const sub = subjects.find(su => su.id === s.subjectId);
                      return `${c?.name || s.classId} (${sub?.code || 'Sub'})`;
                    })
                )
              );

              return (
                <div className="mt-2 p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-[11px] text-blue-900 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <span className="font-bold">{activeT.code}: {isTa && activeT.nameTamil ? activeT.nameTamil : activeT.name}</span>
                    <span className="text-slate-500 font-normal">({activeT.department})</span>
                  </div>
                  {handledSubs.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1 mt-0.5">
                      <span className="text-slate-600 font-medium">{isTa ? 'கற்பிக்கும் பாடங்கள்:' : 'Subjects Handled:'}</span>
                      {handledSubs.map(s => (
                        <span
                          key={s.id}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white shadow-2xs"
                          style={{ backgroundColor: s.color }}
                        >
                          {s.code}: {isTa && s.tamilName ? s.tamilName : s.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {teacherOtherClasses.length > 0 && (
                    <div className="text-[10px] text-slate-600 truncate mt-0.5">
                      <span className="font-medium text-slate-700">{isTa ? 'ஒதுக்கப்பட்ட வகுப்புகள்:' : 'Active in:'} </span>
                      {teacherOtherClasses.join(', ')}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Swap Period Section */}
          <div className="pt-3 border-t border-slate-200">
            <label className="block font-semibold text-slate-800 mb-1">
              {isTa ? `${day} அன்று மற்றொரு வேளையுடன் இடமாற்றம் செய்ய` : `Swap with another period on ${day}`}
            </label>
            <div className="flex items-center gap-2">
              <select
                value={swapTargetPeriod}
                onChange={e => setSwapTargetPeriod(Number(e.target.value))}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium flex-1 text-slate-800 focus:bg-white"
              >
                {Array.from({ length: currentClass?.periodsPerDay || 8 }).map((_, idx) => {
                  const pNum = idx + 1;
                  if (pNum === period) return null;
                  const targetSlot = allSlots.find(
                    s => s.classId === classId && s.day === day && s.period === pNum
                  );
                  const targetSubject = targetSlot
                    ? subjects.find(s => s.id === targetSlot.subjectId)?.name
                    : (isTa ? 'காலி' : 'Empty');
                  return (
                    <option key={pNum} value={pNum}>
                      {isTa ? `பாடவேளை ${pNum}` : `Period ${pNum}`} ({targetSubject})
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                onClick={handleSwap}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{isTa ? 'இடமாற்று' : 'Swap'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          {existingSlot ? (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isTa ? 'அழிக்க' : 'Clear Slot'}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
            >
              {isTa ? 'ரத்து' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-blue-900 hover:bg-blue-800 text-white shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isTa ? 'சேமிக்க' : 'Save Allotment'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
