import React, { useState, useEffect, useMemo } from 'react';
import {
  SchoolConfig,
  ClassSection,
  Teacher,
  Subject,
  SubjectPeriodRequirement,
  ClassSubjectTeacherMapping,
  TimetableSlot,
  SubstitutionAssignment,
  DayOfWeek,
} from './types/timetable';
import {
  initialSchoolConfig,
  initialClasses,
  initialTeachers,
  initialSubjects,
  initialClassTeacherMappings,
  initialRequirements,
  generateInitialPeriodRequirements,
} from './data/initialData';
import {
  generateSmartTimetable,
  detectTimetableClashes,
  checkSlotAssignmentConflict,
} from './utils/timetableGenerator';
import { ToastProvider, useToast } from './context/ToastContext';
import {
  exportMasterTimetableToCSV,
  downloadCSV,
  triggerPrint,
} from './utils/exportUtils';
import { Header, LanguageMode } from './components/Header';
import { Navigation, ViewTab } from './components/Navigation';
import { MasterTimetableView } from './components/views/MasterTimetableView';
import { ClassWiseView } from './components/views/ClassWiseView';
import { TeacherWiseView } from './components/views/TeacherWiseView';
import { PeriodAllotmentView } from './components/views/PeriodAllotmentView';
import { TeacherAllotmentView } from './components/views/TeacherAllotmentView';
import { FreePeriodScheduleView } from './components/views/FreePeriodScheduleView';
import { GovtOrderNormsView } from './components/views/GovtOrderNormsView';
import { GeneratorView } from './components/views/GeneratorView';
import { EditSlotModal } from './components/modals/EditSlotModal';
import { SchoolSettingsModal } from './components/modals/SchoolSettingsModal';

// Storage key for Classes 1 to 12 with Higher Secondary Class Combine & Individual allocations & TN Govt 40 Periods
const STORAGE_KEY = 'ghss_timetable_data_v4_govt_periods';

function TimetableAppContent() {
  const { addToast } = useToast();
  const [languageMode, setLanguageMode] = useState<LanguageMode>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_lang`);
      return (saved as LanguageMode) || 'ta';
    } catch {
      return 'ta';
    }
  });

  // Load from local storage or fallback to official data
  const [config, setConfig] = useState<SchoolConfig>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_config`);
      return saved ? JSON.parse(saved) : initialSchoolConfig;
    } catch {
      return initialSchoolConfig;
    }
  });

  const [classes, setClasses] = useState<ClassSection[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_classes`);
      if (saved) {
        const parsed: ClassSection[] = JSON.parse(saved);
        // Ensure 11A-E and 12A-E exist
        const has11A = parsed.some(c => c.id === 'cls-11-a');
        if (!has11A) return initialClasses;
        return parsed;
      }
      return initialClasses;
    } catch {
      return initialClasses;
    }
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_teachers`);
      if (saved) {
        const parsed: Teacher[] = JSON.parse(saved);
        // Ensure Subbulakshmi and other PG teachers exist
        const hasSubbu = parsed.some(t => t.id === 't-subbulakshmi' || t.name.toLowerCase().includes('subbu'));
        if (!hasSubbu) return initialTeachers;
        return parsed;
      }
      return initialTeachers;
    } catch {
      return initialTeachers;
    }
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_subjects`);
      if (saved) {
        const parsed: Subject[] = JSON.parse(saved);
        const hasPhy = parsed.some(s => s.id === 'sub-phy');
        if (!hasPhy) {
          const missing = initialSubjects.filter(initS => !parsed.some(p => p.id === initS.id));
          return [...parsed, ...missing];
        }
        return parsed;
      }
      return initialSubjects;
    } catch {
      return initialSubjects;
    }
  });

  const [mappings, setMappings] = useState<ClassSubjectTeacherMapping[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_mappings`);
      if (saved) {
        const parsed: ClassSubjectTeacherMapping[] = JSON.parse(saved);
        const hasHS = parsed.some(m => m.classId === 'cls-11-a');
        if (!hasHS) return initialClassTeacherMappings;
        return parsed;
      }
      return initialClassTeacherMappings;
    } catch {
      return initialClassTeacherMappings;
    }
  });

  const [requirements, setRequirements] = useState<SubjectPeriodRequirement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_requirements`);
      if (saved) {
        const parsed: SubjectPeriodRequirement[] = JSON.parse(saved);
        const hasHSReq = parsed.some(r => r.classId === 'cls-11-a');
        if (!hasHSReq) return initialRequirements;
        return parsed;
      }
      return initialRequirements;
    } catch {
      return initialRequirements;
    }
  });

  const [slots, setSlots] = useState<TimetableSlot[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_slots`);
      if (saved) {
        const parsedSlots: TimetableSlot[] = JSON.parse(saved);
        const hasCombined = parsedSlots.some(s => s.isCombined);
        if (!hasCombined) {
          const gen = generateSmartTimetable(
            initialSchoolConfig,
            initialClasses,
            initialTeachers,
            initialSubjects,
            initialClassTeacherMappings,
            initialRequirements,
            true
          );
          return gen.slots;
        }
        return parsedSlots;
      }
      const gen = generateSmartTimetable(
        initialSchoolConfig,
        initialClasses,
        initialTeachers,
        initialSubjects,
        initialClassTeacherMappings,
        initialRequirements,
        true
      );
      return gen.slots;
    } catch {
      const gen = generateSmartTimetable(
        initialSchoolConfig,
        initialClasses,
        initialTeachers,
        initialSubjects,
        initialClassTeacherMappings,
        initialRequirements,
        true
      );
      return gen.slots;
    }
  });

  const [substitutions, setSubstitutions] = useState<SubstitutionAssignment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_substitutions`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [currentTab, setCurrentTab] = useState<ViewTab>('master');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [editSlotTarget, setEditSlotTarget] = useState<{
    classId: string;
    day: DayOfWeek;
    period: number;
  } | null>(null);

  // Auto-save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_lang`, languageMode);
      localStorage.setItem(`${STORAGE_KEY}_config`, JSON.stringify(config));
      localStorage.setItem(`${STORAGE_KEY}_classes`, JSON.stringify(classes));
      localStorage.setItem(`${STORAGE_KEY}_teachers`, JSON.stringify(teachers));
      localStorage.setItem(`${STORAGE_KEY}_subjects`, JSON.stringify(subjects));
      localStorage.setItem(`${STORAGE_KEY}_mappings`, JSON.stringify(mappings));
      localStorage.setItem(`${STORAGE_KEY}_requirements`, JSON.stringify(requirements));
      localStorage.setItem(`${STORAGE_KEY}_slots`, JSON.stringify(slots));
      localStorage.setItem(`${STORAGE_KEY}_substitutions`, JSON.stringify(substitutions));
    } catch {
      // Ignore quota errors
    }
  }, [languageMode, config, classes, teachers, subjects, mappings, requirements, slots, substitutions]);

  // Real-time clash detection (checking both teacher double-booking & room conflicts)
  const clashes = useMemo(() => {
    return detectTimetableClashes(slots, teachers, classes);
  }, [slots, teachers, classes]);

  // Handlers
  // Helper to format combined class label
  const formatCombinedLabel = (classIds: string[], classList: ClassSection[]): string => {
    if (classIds.length <= 1) return '';
    const matched = classIds.map(id => classList.find(c => c.id === id)).filter(Boolean) as ClassSection[];
    if (matched.length === 0) return classIds.join(',');
    const grade = matched[0].grade;
    const sameGrade = matched.every(c => c.grade === grade);
    if (sameGrade) {
      const sections = matched.map(c => c.section || '').filter(Boolean).sort().join(',');
      return `${grade}${sections}`;
    }
    return matched.map(c => `${c.grade}${c.section || ''}`).join(',');
  };

  // Handlers
  const handleSelectSlot = (classId: string, day: DayOfWeek, period: number) => {
    setEditSlotTarget({ classId, day, period });
  };

  const handleSaveSlot = (
    partialSlot: Partial<TimetableSlot>,
    syncCombined: boolean = true,
    targetClassIds?: string[]
  ) => {
    if (!editSlotTarget) return;
    const { classId, day, period } = editSlotTarget;
    const targetClass = classes.find(c => c.id === classId);

    // Find the slot being edited
    const existingSlot = slots.find(
      s => s.classId === classId && s.day === day && s.period === period
    );

    // Determine which classes should be updated
    let classIdsToUpdate = [classId];
    if (syncCombined) {
      if (targetClassIds && targetClassIds.length > 0) {
        classIdsToUpdate = Array.from(new Set([classId, ...targetClassIds]));
      } else if (existingSlot?.combinedClassIds && existingSlot.combinedClassIds.length > 0) {
        classIdsToUpdate = Array.from(new Set([classId, ...existingSlot.combinedClassIds]));
      } else if (existingSlot?.combinedGroupId) {
        const groupSlots = slots.filter(
          s => s.day === day && s.period === period && s.combinedGroupId === existingSlot.combinedGroupId
        );
        classIdsToUpdate = Array.from(new Set([classId, ...groupSlots.map(s => s.classId)]));
      } else if (partialSlot.combinedClassIds && partialSlot.combinedClassIds.length > 0) {
        classIdsToUpdate = Array.from(new Set([classId, ...partialSlot.combinedClassIds]));
      }
    }

    const isNowCombined = classIdsToUpdate.length > 1;
    const combinedLabel = isNowCombined
      ? partialSlot.combinedLabel || formatCombinedLabel(classIdsToUpdate, classes)
      : undefined;
    const combinedGroupId = isNowCombined
      ? partialSlot.combinedGroupId || existingSlot?.combinedGroupId || `grp-${day.toLowerCase().slice(0, 3)}-p${period}-${Date.now()}`
      : undefined;

    // If a subject is being assigned, validate for conflicts immediately
    if (partialSlot.subjectId) {
      const targetRoom = (partialSlot.room || targetClass?.roomNumber || '').trim();

      const conflictCheck = checkSlotAssignmentConflict(
        {
          classId,
          day,
          period,
          teacherId: partialSlot.teacherId,
          subjectId: partialSlot.subjectId,
          room: targetRoom,
          isCombined: isNowCombined,
          combinedGroupId,
        },
        slots.filter(s => !classIdsToUpdate.includes(s.classId)),
        teachers,
        classes,
        subjects
      );

      // Trigger Immediate Toast Alerts if conflict is created
      if (conflictCheck.hasTeacherConflict) {
        addToast({
          type: 'warning',
          title: '⚠️ ஆசிரியர் பணி முரண்பாடு (Teacher Double-Booking)',
          titleTamil: '⚠️ ஆசிரியர் பணி முரண்பாடு!',
          message: conflictCheck.teacherConflictMessage || 'Teacher is already assigned to another class during this period!',
          messageTamil: conflictCheck.teacherConflictMessageTamil || 'இந்த ஆசிரியர் ஏற்கனவே மற்றொரு வகுப்பில் உள்ளார்!',
          details: `${conflictCheck.conflictingTeacherName} · ${conflictCheck.conflictingClassName} · ${day} Period ${period}`,
          duration: 6500,
        });
      }

      if (conflictCheck.hasRoomConflict) {
        addToast({
          type: 'error',
          title: '🏢 அறை/ஆய்வக முரண்பாடு (Room Collision Conflict)',
          titleTamil: '🏢 அறை / ஆய்வக முரண்பாடு!',
          message: conflictCheck.roomConflictMessage || 'Room is already occupied by another class during this period!',
          messageTamil: conflictCheck.roomConflictMessageTamil || 'இந்த அறை ஏற்கனவே மற்றொரு வகுப்பால் பயன்படுத்தப்படுகிறது!',
          details: `Room "${conflictCheck.conflictingRoomName}" · ${day} Period ${period}`,
          duration: 6500,
        });
      }

      if (!conflictCheck.hasConflict) {
        const sub = subjects.find(s => s.id === partialSlot.subjectId);
        const assignedT = teachers.find(t => t.id === partialSlot.teacherId);
        const classNamesStr = classIdsToUpdate.map(id => classes.find(c => c.id === id)?.name || id).join(', ');
        addToast({
          type: 'success',
          title: 'Schedule Updated & Synced',
          titleTamil: 'வேளை ஒதுக்கீடு புதுப்பிக்கப்பட்டது',
          message: `${sub?.name || 'Subject'} (${assignedT?.name || 'Teacher'}) allotted to ${classNamesStr} on ${day} Period ${period}.`,
          messageTamil: `${classNamesStr} வகுப்புக்கு (${assignedT?.name || ''}) ${day} பாடவேளை ${period} ஆசிரியர் அட்டவணையில் புதுப்பிக்கப்பட்டது.`,
          duration: 3500,
        });
      }
    }

    setSlots(prev => {
      // 1. Remove old slots for all classIdsToUpdate at this day & period
      const filtered = prev.filter(
        s => !(classIdsToUpdate.includes(s.classId) && s.day === day && s.period === period)
      );

      // 2. If existingSlot had a combinedGroupId and was unlinked (!syncCombined),
      // update remaining slots in that combined group so they know this class was detached
      if (existingSlot?.combinedGroupId && !syncCombined) {
        const remainingGroupSlots = filtered.filter(
          s => s.day === day && s.period === period && s.combinedGroupId === existingSlot.combinedGroupId
        );
        const remainingClassIds = remainingGroupSlots.map(s => s.classId);
        const newGroupLabel = formatCombinedLabel(remainingClassIds, classes);
        remainingGroupSlots.forEach(s => {
          s.combinedClassIds = remainingClassIds;
          s.combinedLabel = newGroupLabel;
          s.isCombined = remainingClassIds.length > 1;
        });
      }

      // 3. Add new slots for each class in classIdsToUpdate
      if (partialSlot.subjectId) {
        classIdsToUpdate.forEach(cid => {
          filtered.push({
            id: `slot-${day.toLowerCase().slice(0, 3)}-p${period}-${cid}-${Date.now()}`,
            classId: cid,
            day,
            period,
            subjectId: partialSlot.subjectId!,
            teacherId: partialSlot.teacherId || '',
            room: partialSlot.room,
            isCombined: isNowCombined,
            combinedLabel,
            combinedClassIds: isNowCombined ? classIdsToUpdate : undefined,
            combinedGroupId,
          });
        });
      }

      return [...filtered];
    });
  };

  const handleDeleteSlot = (
    classId: string,
    day: DayOfWeek,
    period: number,
    deleteEntireGroup: boolean = true
  ) => {
    const existingSlot = slots.find(
      s => s.classId === classId && s.day === day && s.period === period
    );

    let classIdsToDelete = [classId];
    if (deleteEntireGroup && existingSlot?.isCombined) {
      if (existingSlot.combinedClassIds && existingSlot.combinedClassIds.length > 0) {
        classIdsToDelete = Array.from(new Set([classId, ...existingSlot.combinedClassIds]));
      } else if (existingSlot.combinedGroupId) {
        const groupSlots = slots.filter(
          s => s.day === day && s.period === period && s.combinedGroupId === existingSlot.combinedGroupId
        );
        classIdsToDelete = Array.from(new Set([classId, ...groupSlots.map(s => s.classId)]));
      }
    }

    setSlots(prev =>
      prev.filter(s => !(classIdsToDelete.includes(s.classId) && s.day === day && s.period === period))
    );

    const deletedNames = classIdsToDelete.map(id => classes.find(c => c.id === id)?.name || id).join(', ');
    addToast({
      type: 'info',
      title: 'Slot Cleared',
      titleTamil: 'வேளை ஒதுக்கீடு நீக்கப்பட்டது',
      message: `Cleared allotment for ${deletedNames} on ${day} Period ${period}.`,
      messageTamil: `${deletedNames} வகுப்பின் ${day} பாடவேளை ${period} அட்டவணையில் இருந்து நீக்கப்பட்டது.`,
      duration: 3000,
    });
  };

  const handleSwapSlots = (
    classId: string,
    day: DayOfWeek,
    period1: number,
    period2: number,
    swapEntireGroup: boolean = true
  ) => {
    const slot1 = slots.find(s => s.classId === classId && s.day === day && s.period === period1);
    const slot2 = slots.find(s => s.classId === classId && s.day === day && s.period === period2);

    let classIdsToSwap = [classId];
    if (swapEntireGroup) {
      const g1 = slot1?.combinedClassIds || (slot1?.combinedGroupId ? slots.filter(s => s.day === day && s.period === period1 && s.combinedGroupId === slot1.combinedGroupId).map(s => s.classId) : []);
      const g2 = slot2?.combinedClassIds || (slot2?.combinedGroupId ? slots.filter(s => s.day === day && s.period === period2 && s.combinedGroupId === slot2.combinedGroupId).map(s => s.classId) : []);
      classIdsToSwap = Array.from(new Set([classId, ...g1, ...g2]));
    }

    setSlots(prev => {
      return prev.map(s => {
        if (!classIdsToSwap.includes(s.classId) || s.day !== day) return s;
        if (s.period === period1) {
          return { ...s, period: period2 };
        }
        if (s.period === period2) {
          return { ...s, period: period1 };
        }
        return s;
      });
    });

    addToast({
      type: 'info',
      title: 'Periods Swapped',
      titleTamil: 'வேளைகள் இடமாற்றப்பட்டன',
      message: `Swapped Period ${period1} and Period ${period2} on ${day}.`,
      messageTamil: `${day} பாடவேளை ${period1} மற்றும் ${period2} இடமாற்றப்பட்டன.`,
      duration: 3000,
    });
  };


  const handleGenerateTimetable = (seedFixed: boolean) => {
    const gen = generateSmartTimetable(
      config,
      classes,
      teachers,
      subjects,
      mappings,
      requirements,
      seedFixed
    );
    setSlots(gen.slots);
    setCurrentTab('master');
  };

  const handleApplyOfficialNorms = () => {
    const freshReqs = generateInitialPeriodRequirements();
    setRequirements(freshReqs);
    const gen = generateSmartTimetable(
      config,
      classes,
      teachers,
      subjects,
      mappings,
      freshReqs,
      true
    );
    setSlots(gen.slots);
  };

  const handleClearSlots = () => {
    if (window.confirm('Clear all assigned slots in the timetable? You can regenerate them anytime.')) {
      setSlots([]);
    }
  };

  const handleUpdateRequirement = (updatedReq: SubjectPeriodRequirement) => {
    setRequirements(prev =>
      prev.map(r =>
        r.classId === updatedReq.classId && r.subjectId === updatedReq.subjectId
          ? updatedReq
          : r
      )
    );
  };

  const handleAutoBalanceClass = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return;

    setRequirements(prev =>
      prev.map(r => {
        if (r.classId !== classId) return r;
        const total = r.assignedPerWeek;
        const daysCount = config.days.length;
        const base = Math.floor(total / daysCount);
        const remainder = total % daysCount;

        const newDist: Record<DayOfWeek, number> = {
          Monday: base,
          Tuesday: base,
          Wednesday: base,
          Thursday: base,
          Friday: base,
          Saturday: 0,
        };

        for (let i = 0; i < remainder; i++) {
          const d = config.days[i];
          if (d) newDist[d] += 1;
        }

        return {
          ...r,
          dailyDistribution: newDist,
        };
      })
    );
  };

  const handleUpdateMapping = (classId: string, subjectId: string, teacherId: string) => {
    setMappings(prev => {
      const filtered = prev.filter(m => !(m.classId === classId && m.subjectId === subjectId));
      if (teacherId) {
        filtered.push({ classId, subjectId, teacherId });
      }
      return filtered;
    });

    setSlots(prev =>
      prev.map(s => {
        if (s.classId === classId && s.subjectId === subjectId) {
          return { ...s, teacherId };
        }
        return s;
      })
    );
  };

  const handleAddSubstitution = (sub: SubstitutionAssignment) => {
    setSubstitutions(prev => [...prev.filter(s => s.id !== sub.id), sub]);
  };

  const handleRemoveSubstitution = (id: string) => {
    setSubstitutions(prev => prev.filter(s => s.id !== id));
  };

  const handleExportCSV = () => {
    const csv = exportMasterTimetableToCSV(
      slots,
      classes,
      teachers,
      subjects,
      config.days,
      config.defaultPeriodsPerDay,
      languageMode
    );
    downloadCSV(
      `${config.schoolName.replace(/\s+/g, '_')}_Master_Timetable_1to12.csv`,
      csv
    );
  };

  const handleExportAllJSON = () => {
    const fullBackup = {
      config,
      classes,
      teachers,
      subjects,
      mappings,
      requirements,
      slots,
      substitutions,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(fullBackup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.schoolName.replace(/\s+/g, '_')}_Timetable_1to12_Backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.config) setConfig(data.config);
      if (data.classes) setClasses(data.classes);
      if (data.teachers) setTeachers(data.teachers);
      if (data.subjects) setSubjects(data.subjects);
      if (data.mappings) setMappings(data.mappings);
      if (data.requirements) setRequirements(data.requirements);
      if (data.slots) setSlots(data.slots);
      if (data.substitutions) setSubstitutions(data.substitutions);
    } catch {
      alert('Failed to parse JSON file.');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all timetables and period allotments to the official 2026-2027 Tamil Nadu School Education Department (Classes 1 to 12) benchmark data?')) {
      localStorage.clear();
      setConfig(initialSchoolConfig);
      setClasses(initialClasses);
      setTeachers(initialTeachers);
      setSubjects(initialSubjects);
      setMappings(initialClassTeacherMappings);
      setRequirements(initialRequirements);
      const gen = generateSmartTimetable(
        initialSchoolConfig,
        initialClasses,
        initialTeachers,
        initialSubjects,
        initialClassTeacherMappings,
        initialRequirements,
        true
      );
      setSlots(gen.slots);
      setSubstitutions([]);
      setCurrentTab('master');
    }
  };

  // Teacher CRUD handlers
  const handleAddTeacher = (newTeacher: Teacher) => {
    setTeachers(prev => [...prev, newTeacher]);
  };

  const handleUpdateTeacher = (updatedTeacher: Teacher) => {
    setTeachers(prev => prev.map(t => (t.id === updatedTeacher.id ? updatedTeacher : t)));
  };

  const handleDeleteTeacher = (teacherId: string) => {
    setTeachers(prev => prev.filter(t => t.id !== teacherId));
    setSlots(prev => prev.filter(s => s.teacherId !== teacherId));
    setMappings(prev => prev.filter(m => m.teacherId !== teacherId));
  };

  // Class CRUD handlers
  const handleAddClass = (newClass: ClassSection) => {
    setClasses(prev => [...prev, newClass]);
  };

  const handleUpdateClass = (updatedClass: ClassSection) => {
    setClasses(prev => prev.map(c => (c.id === updatedClass.id ? updatedClass : c)));
  };

  const handleDeleteClass = (classId: string) => {
    setClasses(prev => prev.filter(c => c.id !== classId));
    setSlots(prev => prev.filter(s => s.classId !== classId));
    setMappings(prev => prev.filter(m => m.classId !== classId));
    setRequirements(prev => prev.filter(r => r.classId !== classId));
  };

  // Subject CRUD handlers
  const handleAddSubject = (newSubject: Subject) => {
    setSubjects(prev => [...prev, newSubject]);
  };

  const handleUpdateSubject = (updatedSubject: Subject) => {
    setSubjects(prev => prev.map(s => (s.id === updatedSubject.id ? updatedSubject : s)));
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    setSlots(prev => prev.filter(s => s.subjectId !== subjectId));
    setMappings(prev => prev.filter(m => m.subjectId !== subjectId));
    setRequirements(prev => prev.filter(r => r.subjectId !== subjectId));
  };

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-800 antialiased flex flex-col">
      {/* Top Header */}
      <Header
        config={config}
        clashes={clashes}
        languageMode={languageMode}
        onLanguageChange={setLanguageMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGenerator={() => setCurrentTab('generator')}
        onPrint={triggerPrint}
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
      />

      {/* Primary Navigation Tabs */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        clashCount={clashes.length}
        languageMode={languageMode}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'master' && (
          <MasterTimetableView
            config={config}
            slots={slots}
            classes={classes}
            teachers={teachers}
            subjects={subjects}
            requirements={requirements}
            clashes={clashes}
            languageMode={languageMode}
            onSelectSlot={handleSelectSlot}
            onNavigateToClass={() => setCurrentTab('class')}
          />
        )}

        {currentTab === 'class' && (
          <ClassWiseView
            config={config}
            slots={slots}
            classes={classes}
            teachers={teachers}
            subjects={subjects}
            languageMode={languageMode}
            onSelectSlot={handleSelectSlot}
          />
        )}

        {currentTab === 'teacher' && (
          <TeacherWiseView
            config={config}
            slots={slots}
            classes={classes}
            teachers={teachers}
            subjects={subjects}
            languageMode={languageMode}
            onSelectSlot={handleSelectSlot}
          />
        )}

        {currentTab === 'allotment' && (
          <PeriodAllotmentView
            config={config}
            classes={classes}
            subjects={subjects}
            requirements={requirements}
            languageMode={languageMode}
            onUpdateRequirement={handleUpdateRequirement}
            onAutoBalanceClass={handleAutoBalanceClass}
          />
        )}

        {currentTab === 'workload' && (
          <TeacherAllotmentView
            config={config}
            classes={classes}
            teachers={teachers}
            subjects={subjects}
            slots={slots}
            mappings={mappings}
            languageMode={languageMode}
            onUpdateMapping={handleUpdateMapping}
          />
        )}

        {currentTab === 'free-periods' && (
          <FreePeriodScheduleView
            config={config}
            teachers={teachers}
            slots={slots}
            classes={classes}
            subjects={subjects}
            substitutions={substitutions}
            languageMode={languageMode}
            onAddSubstitution={handleAddSubstitution}
            onRemoveSubstitution={handleRemoveSubstitution}
          />
        )}

        {currentTab === 'govt-norms' && (
          <GovtOrderNormsView
            classes={classes}
            subjects={subjects}
            requirements={requirements}
            slots={slots}
            languageMode={languageMode}
            onApplyOfficialNorms={handleApplyOfficialNorms}
          />
        )}

        {currentTab === 'generator' && (
          <GeneratorView
            config={config}
            classes={classes}
            teachers={teachers}
            subjects={subjects}
            mappings={mappings}
            requirements={requirements}
            slots={slots}
            clashes={clashes}
            languageMode={languageMode}
            onGenerate={handleGenerateTimetable}
            onClearSlots={handleClearSlots}
          />
        )}
      </main>

      {/* Edit Slot Modal */}
      {editSlotTarget && (
        <EditSlotModal
          isOpen={Boolean(editSlotTarget)}
          onClose={() => setEditSlotTarget(null)}
          config={config}
          classId={editSlotTarget.classId}
          day={editSlotTarget.day}
          period={editSlotTarget.period}
          classes={classes}
          teachers={teachers}
          subjects={subjects}
          allSlots={slots}
          languageMode={languageMode}
          onSaveSlot={handleSaveSlot}
          onDeleteSlot={handleDeleteSlot}
          onSwapSlots={handleSwapSlots}
        />
      )}

      {/* Master Data Management & Settings Modal */}
      <SchoolSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        teachers={teachers}
        classes={classes}
        subjects={subjects}
        languageMode={languageMode}
        onSaveConfig={setConfig}
        onAddTeacher={handleAddTeacher}
        onUpdateTeacher={handleUpdateTeacher}
        onDeleteTeacher={handleDeleteTeacher}
        onAddClass={handleAddClass}
        onUpdateClass={handleUpdateClass}
        onDeleteClass={handleDeleteClass}
        onAddSubject={handleAddSubject}
        onUpdateSubject={handleUpdateSubject}
        onDeleteSubject={handleDeleteSubject}
        onExportAllJSON={handleExportAllJSON}
        onImportJSON={handleImportJSON}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <TimetableAppContent />
    </ToastProvider>
  );
}
