import { getLessonTimeWindow, overlaps, hasNarrowGap, lessonDurationMinutes, TimeWindow } from './timeUtils';
import { isQualified } from './certUtils';

export interface ScheduleLesson {
  id: number;
  date: Date;
  discipline: string;
  program: string;
  format: string;
  skillLevel?: string | null;
  startTime?: string | null;
  requestedInstructorId?: number | null;
  weekStartDate: Date;
}

export interface ScheduleInstructor {
  id: number;
  name: string;
  certificationLevel: number;
  isActive: boolean;
  daysOff: { date: Date }[];
}

export interface ScheduleAssignment {
  lessonId: number;
  instructorId: number;
  status: 'assigned' | 'conflict' | 'unresolved' | 'warning';
  warningMsg?: string;
}

export interface ScheduleDayRoster {
  date: Date;
  instructorId: number;
  status: 'scheduled' | 'not-needed' | 'off';
}

export interface ScheduleResult {
  assignments: ScheduleAssignment[];
  dayRosters: ScheduleDayRoster[];
  unresolved: number[]; // lesson IDs that couldn't be assigned
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getWeekDays(weekStartDate: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStartDate);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function isInstructorOffDay(instructor: ScheduleInstructor, date: Date): boolean {
  return instructor.daysOff.some((off) => isSameDay(new Date(off.date), date));
}

export function generateSchedule(
  lessons: ScheduleLesson[],
  instructors: ScheduleInstructor[],
  weekStartDate: Date
): ScheduleResult {
  const activeInstructors = instructors.filter((i) => i.isActive);
  const weekDays = getWeekDays(weekStartDate);

  // Track assignments per instructor per day: instructorId -> date key -> TimeWindow[]
  const instructorDayWindows: Map<number, Map<string, TimeWindow[]>> = new Map();
  // Track total days worked this week per instructor
  const instructorDaysWorked: Map<number, Set<string>> = new Map();

  for (const inst of activeInstructors) {
    instructorDayWindows.set(inst.id, new Map());
    instructorDaysWorked.set(inst.id, new Set());
  }

  const assignments: ScheduleAssignment[] = [];
  const assignedLessonIds = new Set<number>();

  function dateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  function getInstructorWindows(instructorId: number, date: Date): TimeWindow[] {
    const dayMap = instructorDayWindows.get(instructorId)!;
    const key = dateKey(date);
    if (!dayMap.has(key)) dayMap.set(key, []);
    return dayMap.get(key)!;
  }

  function canAssign(instructor: ScheduleInstructor, lesson: ScheduleLesson): {
    ok: boolean;
    conflict: boolean;
    warning: boolean;
    warningMsg?: string;
  } {
    // Check day off
    if (isInstructorOffDay(instructor, lesson.date)) {
      return { ok: false, conflict: false, warning: false };
    }

    // Check certification
    if (!isQualified(instructor.certificationLevel, lesson.format, lesson.skillLevel)) {
      return { ok: false, conflict: false, warning: false };
    }

    const lessonWindow = getLessonTimeWindow(lesson.format, lesson.startTime);
    const existingWindows = getInstructorWindows(instructor.id, lesson.date);

    // Check for time conflicts
    for (const existing of existingWindows) {
      if (overlaps(existing, lessonWindow)) {
        return { ok: false, conflict: true, warning: false };
      }
    }

    // Check for narrow gaps
    for (const existing of existingWindows) {
      if (hasNarrowGap(existing, lessonWindow, 15)) {
        return {
          ok: true,
          conflict: false,
          warning: true,
          warningMsg: 'Less than 15 min gap between lessons',
        };
      }
    }

    return { ok: true, conflict: false, warning: false };
  }

  function assign(lesson: ScheduleLesson, instructor: ScheduleInstructor, status: ScheduleAssignment['status'], warningMsg?: string) {
    assignments.push({
      lessonId: lesson.id,
      instructorId: instructor.id,
      status,
      warningMsg,
    });
    assignedLessonIds.add(lesson.id);

    const window = getLessonTimeWindow(lesson.format, lesson.startTime);
    getInstructorWindows(instructor.id, lesson.date).push(window);

    const dayMap = instructorDaysWorked.get(instructor.id)!;
    dayMap.add(dateKey(lesson.date));
  }

  // Sort lessons by priority for processing
  // Priority: private > group, delirium > black runner > others, full_day > half_day > one_hour
  function lessonPriority(lesson: ScheduleLesson): number {
    let score = 0;
    if (lesson.program === 'private') score += 1000;
    if (lesson.format.includes('delirium')) score += 500;
    if (lesson.skillLevel === 'black_runner') score += 300;
    score += lessonDurationMinutes(lesson.format);
    return score;
  }

  const sortedLessons = [...lessons].sort((a, b) => lessonPriority(b) - lessonPriority(a));

  // PASS 1: Lock private lesson instructor requests (if certified, no conflict)
  for (const lesson of sortedLessons) {
    if (assignedLessonIds.has(lesson.id)) continue;
    if (lesson.program !== 'private') continue;
    if (!lesson.requestedInstructorId) continue;

    const requested = activeInstructors.find((i) => i.id === lesson.requestedInstructorId);
    if (!requested) continue;

    const check = canAssign(requested, lesson);
    if (check.ok) {
      assign(lesson, requested, check.warning ? 'warning' : 'assigned', check.warningMsg);
    } else if (check.conflict) {
      // Still assign but mark as conflict
      assignments.push({
        lessonId: lesson.id,
        instructorId: requested.id,
        status: 'conflict',
        warningMsg: 'Requested instructor has a time conflict',
      });
      assignedLessonIds.add(lesson.id);
      const window = getLessonTimeWindow(lesson.format, lesson.startTime);
      getInstructorWindows(requested.id, lesson.date).push(window);
      instructorDaysWorked.get(requested.id)!.add(dateKey(lesson.date));
    }
  }

  // PASS 2: Honor group lesson instructor requests (if no conflict)
  for (const lesson of sortedLessons) {
    if (assignedLessonIds.has(lesson.id)) continue;
    if (lesson.program !== 'group') continue;
    if (!lesson.requestedInstructorId) continue;

    const requested = activeInstructors.find((i) => i.id === lesson.requestedInstructorId);
    if (!requested) continue;

    const check = canAssign(requested, lesson);
    if (check.ok) {
      assign(lesson, requested, check.warning ? 'warning' : 'assigned', check.warningMsg);
    }
    // If conflict, fall through to general assignment
  }

  // Sort available instructors by certification level (highest first) for priority assignment
  function getBestInstructor(
    lesson: ScheduleLesson,
    availableInstructors: ScheduleInstructor[],
    preferHigherCert: boolean
  ): { instructor: ScheduleInstructor; warning: boolean; warningMsg?: string } | null {
    const sorted = [...availableInstructors].sort((a, b) => {
      if (preferHigherCert) return b.certificationLevel - a.certificationLevel;
      // Balance workload — prefer instructors with fewer days worked
      const daysA = instructorDaysWorked.get(a.id)?.size ?? 0;
      const daysB = instructorDaysWorked.get(b.id)?.size ?? 0;
      if (daysA !== daysB) return daysA - daysB;
      return b.certificationLevel - a.certificationLevel;
    });

    for (const inst of sorted) {
      const check = canAssign(inst, lesson);
      if (check.ok) {
        return { instructor: inst, warning: check.warning, warningMsg: check.warningMsg };
      }
    }
    return null;
  }

  // PASS 3: Assign Black Runner and Delirium Dive to highest-certified available
  for (const lesson of sortedLessons) {
    if (assignedLessonIds.has(lesson.id)) continue;
    if (
      !lesson.format.includes('delirium') &&
      lesson.skillLevel !== 'black_runner'
    ) continue;

    const result = getBestInstructor(lesson, activeInstructors, true);
    if (result) {
      assign(lesson, result.instructor, result.warning ? 'warning' : 'assigned', result.warningMsg);
    }
  }

  // PASS 4: Give longer lessons to higher-certified instructors
  // Process remaining lessons by duration descending, assigning highest cert available
  const remainingByDuration = sortedLessons.filter((l) => !assignedLessonIds.has(l.id));
  remainingByDuration.sort((a, b) => lessonDurationMinutes(b.format) - lessonDurationMinutes(a.format));

  for (const lesson of remainingByDuration) {
    if (assignedLessonIds.has(lesson.id)) continue;

    const preferHigher = lessonDurationMinutes(lesson.format) >= 180;
    const result = getBestInstructor(lesson, activeInstructors, preferHigher);
    if (result) {
      assign(lesson, result.instructor, result.warning ? 'warning' : 'assigned', result.warningMsg);
    }
  }

  // Mark any still-unassigned lessons as unresolved
  const unresolvedIds: number[] = [];
  for (const lesson of lessons) {
    if (!assignedLessonIds.has(lesson.id)) {
      unresolvedIds.push(lesson.id);
      assignments.push({
        lessonId: lesson.id,
        instructorId: 0,
        status: 'unresolved',
        warningMsg: 'No qualified instructor available',
      });
    }
  }

  // Build day rosters
  const dayRosters: ScheduleDayRoster[] = [];

  for (const day of weekDays) {
    const key = dateKey(day);
    for (const inst of activeInstructors) {
      if (isInstructorOffDay(inst, day)) {
        dayRosters.push({ date: day, instructorId: inst.id, status: 'off' });
        continue;
      }

      // Check if instructor has any assignments on this day
      const hasAssignment = assignments.some((a) => {
        if (a.instructorId !== inst.id) return false;
        const lesson = lessons.find((l) => l.id === a.lessonId);
        return lesson && isSameDay(new Date(lesson.date), day);
      });

      if (hasAssignment) {
        dayRosters.push({ date: day, instructorId: inst.id, status: 'scheduled' });
      } else {
        // Check workload — if instructor has 5+ days already, mark not needed
        const daysWorked = instructorDaysWorked.get(inst.id)?.size ?? 0;
        if (daysWorked >= 5) {
          dayRosters.push({ date: day, instructorId: inst.id, status: 'not-needed' });
        } else {
          dayRosters.push({ date: day, instructorId: inst.id, status: 'not-needed' });
        }
      }
    }
  }

  return { assignments, dayRosters, unresolved: unresolvedIds };
}
