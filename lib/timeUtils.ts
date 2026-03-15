export interface TimeWindow {
  start: number; // minutes since midnight
  end: number;   // minutes since midnight
}

export function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export type LessonFormat =
  | 'full_day'
  | 'half_day'
  | 'one_hour'
  | 'one_hour_kids'
  | 'full_day_delirium'
  | 'half_day_delirium'
  | 'full_day_kids'
  | 'half_day_kids';

export function getLessonTimeWindow(
  format: string,
  startTime?: string | null
): TimeWindow {
  switch (format) {
    case 'full_day':
    case 'full_day_kids':
    case 'full_day_delirium':
      return { start: parseTime('10:30'), end: parseTime('15:30') };
    case 'half_day':
    case 'half_day_kids':
    case 'half_day_delirium':
      return { start: parseTime('13:00'), end: parseTime('16:00') };
    case 'one_hour':
    case 'one_hour_kids':
      if (startTime) {
        const start = parseTime(startTime);
        return { start, end: start + 60 };
      }
      return { start: parseTime('09:00'), end: parseTime('10:00') };
    default:
      return { start: parseTime('10:30'), end: parseTime('15:30') };
  }
}

export function overlaps(a: TimeWindow, b: TimeWindow): boolean {
  return a.start < b.end && b.start < a.end;
}

export function gapMinutes(a: TimeWindow, b: TimeWindow): number {
  if (a.end <= b.start) return b.start - a.end;
  if (b.end <= a.start) return a.start - b.end;
  return 0; // overlapping
}

export function hasNarrowGap(a: TimeWindow, b: TimeWindow, thresholdMinutes = 15): boolean {
  const gap = gapMinutes(a, b);
  return gap > 0 && gap < thresholdMinutes;
}

export function lessonDurationMinutes(format: string): number {
  switch (format) {
    case 'full_day':
    case 'full_day_kids':
    case 'full_day_delirium':
      return 300; // 5 hours
    case 'half_day':
    case 'half_day_kids':
    case 'half_day_delirium':
      return 180; // 3 hours
    case 'one_hour':
    case 'one_hour_kids':
      return 60;
    default:
      return 300;
  }
}
