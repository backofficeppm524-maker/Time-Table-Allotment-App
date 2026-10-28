import {
  DayOfWeek,
  TimetableSlot,
  TimetableClash,
  ClassSection,
  Teacher,
  Subject,
  SubjectPeriodRequirement,
  ClassSubjectTeacherMapping,
  SchoolConfig,
} from '../types/timetable';
import { generateHigherSecondaryBenchmarkSlots } from '../data/initialData';

/**
 * Validates timetable slots and detects clashes:
 * 1. Teacher double-booking (Teacher assigned to multiple classes in same day & period)
 * Note: Combined classes (marked with isCombined = true or sharing a combinedGroupId)
 * are deliberate joint lectures and are explicitly exempted from double-booking.
 */
export interface SlotConflictCheckResult {
  hasConflict: boolean;
  hasTeacherConflict: boolean;
  teacherConflictMessage?: string;
  teacherConflictMessageTamil?: string;
  conflictingTeacherName?: string;
  conflictingClassName?: string;
  hasRoomConflict: boolean;
  roomConflictMessage?: string;
  roomConflictMessageTamil?: string;
  conflictingRoomName?: string;
}

/**
 * Validates timetable slots and detects clashes:
 * 1. Teacher double-booking (Teacher assigned to multiple classes in same day & period)
 * 2. Room conflict (Same room/lab assigned to multiple classes in same day & period)
 * Note: Combined classes (marked with isCombined = true or sharing a combinedGroupId)
 * are deliberate joint lectures and are explicitly exempted from double-booking.
 */
export function detectTimetableClashes(
  slots: TimetableSlot[],
  teachers: Teacher[],
  classes?: ClassSection[]
): TimetableClash[] {
  const clashes: TimetableClash[] = [];
  const teacherMap = new Map<string, Teacher>(teachers.map(t => [t.id, t]));
  const classMap = classes ? new Map<string, ClassSection>(classes.map(c => [c.id, c])) : null;

  // 1. Group by day-period-teacher
  const slotGroups = new Map<string, TimetableSlot[]>();

  for (const slot of slots) {
    if (!slot.teacherId) continue;
    const key = `${slot.day}_${slot.period}_${slot.teacherId}`;
    const group = slotGroups.get(key) || [];
    group.push(slot);
    slotGroups.set(key, group);
  }

  slotGroups.forEach((groupedSlots, key) => {
    if (groupedSlots.length > 1) {
      // Check if this is an intentional combined class
      const isLegitCombine =
        groupedSlots.every(s => s.isCombined) &&
        (
          (groupedSlots[0].combinedGroupId && groupedSlots.every(s => s.combinedGroupId === groupedSlots[0].combinedGroupId)) ||
          groupedSlots.every(s => s.subjectId === groupedSlots[0].subjectId)
        );

      if (isLegitCombine) {
        // Intended combined lecture across sections
        return;
      }

      const [day, periodStr, teacherId] = key.split('_');
      const teacher = teacherMap.get(teacherId);
      const teacherName = teacher ? `${teacher.code} (${teacher.name})` : teacherId;
      const classNames = groupedSlots.map(s => {
        const cls = classMap?.get(s.classId);
        return cls?.name || s.classId;
      }).join(', ');

      clashes.push({
        type: 'TEACHER_DOUBLE_BOOKING',
        day: day as DayOfWeek,
        period: Number(periodStr),
        teacherId,
        affectedClassIds: groupedSlots.map(s => s.classId),
        message: `Teacher conflict: ${teacherName} is double-booked on ${day} Period ${periodStr} across classes (${classNames}).`,
      });
    }
  });

  // 2. Group by day-period-room (Room conflict detection)
  if (classMap) {
    const roomGroups = new Map<string, TimetableSlot[]>();

    for (const slot of slots) {
      const cls = classMap.get(slot.classId);
      const room = slot.room || cls?.roomNumber;
      if (!room || room.trim() === '') continue;

      const key = `${slot.day}_${slot.period}_${room.trim().toLowerCase()}`;
      const group = roomGroups.get(key) || [];
      group.push(slot);
      roomGroups.set(key, group);
    }

    roomGroups.forEach((groupedSlots, key) => {
      if (groupedSlots.length > 1) {
        // Intentional combined classes can share a room
        const isLegitCombine =
          groupedSlots.every(s => s.isCombined) &&
          (
            (groupedSlots[0].combinedGroupId && groupedSlots.every(s => s.combinedGroupId === groupedSlots[0].combinedGroupId)) ||
            groupedSlots.every(s => s.subjectId === groupedSlots[0].subjectId)
          );

        if (isLegitCombine) {
          return;
        }

        const [day, periodStr, ...roomParts] = key.split('_');
        const roomName = roomParts.join('_');
        const classNames = groupedSlots.map(s => classMap.get(s.classId)?.name || s.classId).join(', ');

        clashes.push({
          type: 'ROOM_CONFLICT',
          day: day as DayOfWeek,
          period: Number(periodStr),
          affectedClassIds: groupedSlots.map(s => s.classId),
          message: `Room conflict: Room/Lab "${roomName.toUpperCase()}" is double-booked on ${day} Period ${periodStr} across classes (${classNames}).`,
        });
      }
    });
  }

  return clashes;
}

/**
 * Checks for conflicts specifically when saving or updating an individual slot.
 * Useful for real-time validation and immediate toast notifications.
 */
export function checkSlotAssignmentConflict(
  targetSlot: {
    classId: string;
    day: DayOfWeek;
    period: number;
    teacherId?: string;
    subjectId?: string;
    room?: string;
    isCombined?: boolean;
    combinedGroupId?: string;
  },
  existingSlots: TimetableSlot[],
  teachers: Teacher[],
  classes: ClassSection[],
  subjects: Subject[]
): SlotConflictCheckResult {
  const teacherMap = new Map<string, Teacher>(teachers.map(t => [t.id, t]));
  const classMap = new Map<string, ClassSection>(classes.map(c => [c.id, c]));
  const targetClass = classMap.get(targetSlot.classId);

  // 1. Check Teacher Conflict
  let hasTeacherConflict = false;
  let teacherConflictMessage: string | undefined;
  let teacherConflictMessageTamil: string | undefined;
  let conflictingTeacherName: string | undefined;
  let conflictingClassName: string | undefined;

  if (targetSlot.teacherId && targetSlot.teacherId.trim() !== '') {
    const conflictingSlot = existingSlots.find(s => {
      if (s.classId === targetSlot.classId) return false;
      if (s.day !== targetSlot.day || s.period !== targetSlot.period) return false;
      if (s.teacherId !== targetSlot.teacherId) return false;

      // Allow intentional combined lectures
      if (
        s.isCombined &&
        targetSlot.isCombined &&
        (
          (s.combinedGroupId && targetSlot.combinedGroupId && s.combinedGroupId === targetSlot.combinedGroupId) ||
          (s.subjectId === targetSlot.subjectId)
        )
      ) {
        return false;
      }
      return true;
    });

    if (conflictingSlot) {
      hasTeacherConflict = true;
      const teacher = teacherMap.get(targetSlot.teacherId);
      const confClass = classMap.get(conflictingSlot.classId);
      conflictingTeacherName = teacher?.name || targetSlot.teacherId;
      conflictingClassName = confClass?.name || conflictingSlot.classId;

      teacherConflictMessage = `Teacher ${teacher?.name || targetSlot.teacherId} (${teacher?.code || ''}) is already scheduled in ${confClass?.name || conflictingSlot.classId} on ${targetSlot.day} Period ${targetSlot.period}.`;
      teacherConflictMessageTamil = `ஆசிரியர் ${teacher?.nameTamil || teacher?.name || ''} ஏற்கனவே ${targetSlot.day} பாடவேளை ${targetSlot.period}-ல் ${confClass?.nameTamil || confClass?.name || ''} வகுப்பில் உள்ளார்.`;
    }
  }

  // 2. Check Room Conflict
  let hasRoomConflict = false;
  let roomConflictMessage: string | undefined;
  let roomConflictMessageTamil: string | undefined;
  let conflictingRoomName: string | undefined;

  const targetRoom = (targetSlot.room || targetClass?.roomNumber || '').trim();
  if (targetRoom !== '') {
    const conflictingSlot = existingSlots.find(s => {
      if (s.classId === targetSlot.classId) return false;
      if (s.day !== targetSlot.day || s.period !== targetSlot.period) return false;

      const otherClass = classMap.get(s.classId);
      const otherRoom = (s.room || otherClass?.roomNumber || '').trim();
      if (!otherRoom || otherRoom.toLowerCase() !== targetRoom.toLowerCase()) return false;

      // Allow intentional combined classes sharing same room
      if (
        s.isCombined &&
        targetSlot.isCombined &&
        (
          (s.combinedGroupId && targetSlot.combinedGroupId && s.combinedGroupId === targetSlot.combinedGroupId) ||
          (s.subjectId === targetSlot.subjectId)
        )
      ) {
        return false;
      }
      return true;
    });

    if (conflictingSlot) {
      hasRoomConflict = true;
      const confClass = classMap.get(conflictingSlot.classId);
      conflictingRoomName = targetRoom;

      roomConflictMessage = `Room/Lab "${targetRoom}" is already occupied by ${confClass?.name || conflictingSlot.classId} on ${targetSlot.day} Period ${targetSlot.period}.`;
      roomConflictMessageTamil = `அறை/ஆய்வகம் "${targetRoom}" ஏற்கனவே ${targetSlot.day} பாடவேளை ${targetSlot.period}-ல் ${confClass?.nameTamil || confClass?.name || ''} வகுப்பால் பயன்படுத்தப்படுகிறது.`;
    }
  }

  return {
    hasConflict: hasTeacherConflict || hasRoomConflict,
    hasTeacherConflict,
    teacherConflictMessage,
    teacherConflictMessageTamil,
    conflictingTeacherName,
    conflictingClassName,
    hasRoomConflict,
    roomConflictMessage,
    roomConflictMessageTamil,
    conflictingRoomName,
  };
}

/**
 * Calculates free periods for every teacher on each working day.
 * Distinct teaching periods count as occupied.
 */
export function calculateTeacherFreePeriods(
  teachers: Teacher[],
  slots: TimetableSlot[],
  days: DayOfWeek[],
  maxPeriods: number = 8
): Record<string, Record<DayOfWeek, number[]>> {
  const freeMap: Record<string, Record<DayOfWeek, number[]>> = {};

  for (const t of teachers) {
    freeMap[t.id] = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    };
  }

  const occupiedSet = new Set<string>();
  for (const slot of slots) {
    if (slot.teacherId) {
      occupiedSet.add(`${slot.teacherId}_${slot.day}_${slot.period}`);
    }
  }

  for (const t of teachers) {
    for (const day of days) {
      const freeList: number[] = [];
      for (let p = 1; p <= maxPeriods; p++) {
        if (!occupiedSet.has(`${t.id}_${day}_${p}`)) {
          freeList.push(p);
        }
      }
      freeMap[t.id][day] = freeList;
    }
  }

  return freeMap;
}

/**
 * Calculates teacher load distribution matching official norms:
 * "TEACHER WISE PERIOD ALLOTMENT AND TEACHER'S PERIOD LOAD"
 * Note: A combined class teaching 1 period across 3 sections counts as 1 period in teacher load.
 */
export interface TeacherLoadSummary {
  teacher: Teacher;
  allocations: {
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
    periodCount: number;
    isCombined?: boolean;
  }[];
  totalPeriods: number;
  isOverloaded: boolean;
}

export function calculateTeacherLoads(
  teachers: Teacher[],
  classes: ClassSection[],
  subjects: Subject[],
  slots: TimetableSlot[]
): TeacherLoadSummary[] {
  const classMap = new Map(classes.map(c => [c.id, c.name]));
  const subMap = new Map(subjects.map(s => [s.id, s.name]));

  return teachers.map(teacher => {
    const teacherSlots = slots.filter(s => s.teacherId === teacher.id);

    // Group teacher's slots into distinct teaching sessions (day + period)
    const sessionMap = new Map<
      string,
      {
        classIds: string[];
        classLabel: string;
        subjectId: string;
        isCombined: boolean;
        slots: TimetableSlot[];
      }
    >();

    for (const s of teacherSlots) {
      const sessionKey = s.combinedGroupId
        ? s.combinedGroupId
        : s.isCombined
        ? `${s.day}_${s.period}_${s.subjectId}_comb`
        : `${s.day}_${s.period}_${s.classId}_${s.subjectId}`;

      if (!sessionMap.has(sessionKey)) {
        sessionMap.set(sessionKey, {
          classIds: [s.classId],
          classLabel: s.combinedLabel || classMap.get(s.classId) || s.classId,
          subjectId: s.subjectId,
          isCombined: Boolean(s.isCombined),
          slots: [s],
        });
      } else {
        const sess = sessionMap.get(sessionKey)!;
        sess.classIds.push(s.classId);
        if (s.combinedLabel) sess.classLabel = s.combinedLabel;
        sess.slots.push(s);
      }
    }

    const totalPeriods = sessionMap.size;

    // Group into neat allocation rows for workload cards
    const allocationCountMap = new Map<
      string,
      {
        classId: string;
        className: string;
        subjectId: string;
        subjectName: string;
        periodCount: number;
        isCombined?: boolean;
      }
    >();

    sessionMap.forEach(sess => {
      const aggKey = `${sess.classLabel}_${sess.subjectId}`;
      if (!allocationCountMap.has(aggKey)) {
        allocationCountMap.set(aggKey, {
          classId: sess.classIds[0],
          className: sess.classLabel,
          subjectId: sess.subjectId,
          subjectName: subMap.get(sess.subjectId) || sess.subjectId,
          periodCount: 1,
          isCombined: sess.isCombined,
        });
      } else {
        allocationCountMap.get(aggKey)!.periodCount += 1;
      }
    });

    return {
      teacher,
      allocations: Array.from(allocationCountMap.values()),
      totalPeriods,
      isOverloaded: totalPeriods > teacher.maxWeeklyLoad,
    };
  });
}

/**
 * Constraint-satisfaction Timetable Auto-Generator
 * Generates an optimized, clash-free master timetable according to:
 * - Requirements (how many periods per day per subject)
 * - Class-Subject-Teacher mappings
 * - Strict zero-teacher-double-booking rule with synchronized combined lectures
 */
export function generateSmartTimetable(
  config: SchoolConfig,
  classes: ClassSection[],
  teachers: Teacher[],
  subjects: Subject[],
  mappings: ClassSubjectTeacherMapping[],
  requirements: SubjectPeriodRequirement[],
  seedFixedSlots: boolean = true
): { slots: TimetableSlot[]; clashes: TimetableClash[]; success: boolean } {
  const resultSlots: TimetableSlot[] = [];
  const teacherBusySet = new Set<string>(); // key: `${teacherId}_${day}_${period}`
  let idCounter = 1;

  // Build mapping lookup: `${classId}_${subjectId}` => teacherId
  const mappingMap = new Map<string, string>();
  for (const m of mappings) {
    mappingMap.set(`${m.classId}_${m.subjectId}`, m.teacherId);
  }

  // Seed pre-defined Higher Secondary benchmark slots and Primary seeds
  if (seedFixedSlots) {
    // 1. Primary seeds
    const fixedSeeds: { classId: string; day: DayOfWeek; period: number; subId: string; teacherId: string }[] = [
      { classId: 'cls-1', day: 'Monday', period: 1, subId: 'sub-tam', teacherId: 't-1' },
      { classId: 'cls-1', day: 'Monday', period: 2, subId: 'sub-eng', teacherId: 't-2' },
      { classId: 'cls-2', day: 'Monday', period: 1, subId: 'sub-math', teacherId: 't-4' },
      { classId: 'cls-2', day: 'Monday', period: 2, subId: 'sub-eng', teacherId: 't-6' },
    ];

    for (const f of fixedSeeds) {
      resultSlots.push({
        id: `slot-${idCounter++}`,
        classId: f.classId,
        day: f.day,
        period: f.period,
        subjectId: f.subId,
        teacherId: f.teacherId,
      });
      teacherBusySet.add(`${f.teacherId}_${f.day}_${f.period}`);
    }

    // 2. Higher Secondary benchmark slots
    const hsSlots = generateHigherSecondaryBenchmarkSlots();
    for (const hs of hsSlots) {
      resultSlots.push(hs);
      if (!hs.isCombined) {
        teacherBusySet.add(`${hs.teacherId}_${hs.day}_${hs.period}`);
      }
    }
  }

  // Pre-seed occupied set for classes that already have slots
  const classesWithPreSeededSlots = new Set(resultSlots.map(s => s.classId));

  // For each day, solve for remaining classes (Primary 1-5, Middle 6-8, High 9-10)
  for (const day of config.days) {
    for (const cls of classes) {
      // If this class is higher secondary and was fully pre-seeded, skip
      const existingInClassDay = resultSlots.filter(s => s.classId === cls.id && s.day === day);
      if (existingInClassDay.length >= cls.periodsPerDay) {
        continue;
      }

      const maxPeriods = cls.periodsPerDay;
      const classReqs = requirements.filter(r => r.classId === cls.id);

      // Collect required subjects for this class on this day
      const subjectPool: string[] = [];
      for (const cr of classReqs) {
        const count = cr.dailyDistribution[day] || 0;
        for (let i = 0; i < count; i++) {
          subjectPool.push(cr.subjectId);
        }
      }

      // Check which periods are already filled for this class & day
      const occupiedPeriods = new Set(
        existingInClassDay.map(s => {
          const idx = subjectPool.indexOf(s.subjectId);
          if (idx !== -1) subjectPool.splice(idx, 1);
          return s.period;
        })
      );

      const availablePeriods: number[] = [];
      for (let p = 1; p <= maxPeriods; p++) {
        if (!occupiedPeriods.has(p)) {
          availablePeriods.push(p);
        }
      }

      // Place remaining subjects in available periods with conflict checking
      for (const subjectId of [...subjectPool]) {
        const teacherId = mappingMap.get(`${cls.id}_${subjectId}`) || '';
        let placed = false;

        for (let i = 0; i < availablePeriods.length; i++) {
          const p = availablePeriods[i];
          const busyKey = `${teacherId}_${day}_${p}`;

          if (!teacherBusySet.has(busyKey)) {
            resultSlots.push({
              id: `slot-${idCounter++}`,
              classId: cls.id,
              day,
              period: p,
              subjectId,
              teacherId,
            });
            teacherBusySet.add(busyKey);
            availablePeriods.splice(i, 1);
            placed = true;
            break;
          }
        }

        if (!placed && availablePeriods.length > 0) {
          const fallbackPeriod = availablePeriods.shift()!;
          resultSlots.push({
            id: `slot-${idCounter++}`,
            classId: cls.id,
            day,
            period: fallbackPeriod,
            subjectId,
            teacherId,
          });
          if (teacherId) {
            teacherBusySet.add(`${teacherId}_${day}_${fallbackPeriod}`);
          }
        }
      }
    }
  }

  // Run clash resolution pass for junior classes
  resolveClashesPass(resultSlots, config.days, mappingMap);

  const clashes = detectTimetableClashes(resultSlots, teachers);
  return {
    slots: resultSlots,
    clashes,
    success: clashes.length === 0,
  };
}

/**
 * Post-processing pass to swap periods within same class & day to resolve teacher collisions
 */
function resolveClashesPass(
  slots: TimetableSlot[],
  days: DayOfWeek[],
  mappingMap: Map<string, string>
) {
  for (const day of days) {
    let iteration = 0;
    while (iteration < 20) {
      iteration++;
      const occMap = new Map<string, TimetableSlot[]>();
      for (const slot of slots) {
        if (slot.day === day && slot.teacherId && !slot.isCombined) {
          const key = `${slot.teacherId}_${slot.period}`;
          const arr = occMap.get(key) || [];
          arr.push(slot);
          occMap.set(key, arr);
        }
      }

      let hadConflict = false;
      for (const [, conflictingSlots] of occMap.entries()) {
        if (conflictingSlots.length > 1) {
          hadConflict = true;
          const slotToMove = conflictingSlots[1];
          const sameClassSlots = slots.filter(
            s => s.classId === slotToMove.classId && s.day === day && s.id !== slotToMove.id && !s.isCombined
          );

          for (const candidateSlot of sameClassSlots) {
            const t1 = slotToMove.teacherId;
            const t2 = candidateSlot.teacherId;
            const p1 = slotToMove.period;
            const p2 = candidateSlot.period;

            const t1ConflictAtP2 = slots.some(
              s => s.day === day && s.period === p2 && s.teacherId === t1 && s.id !== slotToMove.id && !s.isCombined
            );
            const t2ConflictAtP1 = slots.some(
              s => s.day === day && s.period === p1 && s.teacherId === t2 && s.id !== candidateSlot.id && !s.isCombined
            );

            if (!t1ConflictAtP2 && !t2ConflictAtP1) {
              slotToMove.period = p2;
              candidateSlot.period = p1;
              break;
            }
          }
        }
      }

      if (!hadConflict) break;
    }
  }
}
