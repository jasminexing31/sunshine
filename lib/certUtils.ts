export function getMinCertLevel(format: string, skillLevel?: string | null): number {
  // Delirium Dive requires Level 4
  if (format === 'full_day_delirium' || format === 'half_day_delirium') {
    return 4;
  }

  // Kids lessons require Level 2+
  if (format === 'full_day_kids' || format === 'half_day_kids' || format === 'one_hour_kids') {
    return 2;
  }

  // Black Runner group lessons require Level 3+
  if (skillLevel === 'black_runner') {
    return 3;
  }

  // All others require Level 1+
  return 1;
}

export function isQualified(
  certLevel: number,
  format: string,
  skillLevel?: string | null
): boolean {
  return certLevel >= getMinCertLevel(format, skillLevel);
}

export function certLevelLabel(level: number): string {
  switch (level) {
    case 1: return 'Level 1';
    case 2: return 'Level 2';
    case 3: return 'Level 3';
    case 4: return 'Level 4';
    default: return `Level ${level}`;
  }
}

export function formatLabel(format: string): string {
  switch (format) {
    case 'full_day': return 'Full Day';
    case 'half_day': return 'Half Day';
    case 'one_hour': return '1-Hour';
    case 'one_hour_kids': return '1-Hour (Kids)';
    case 'full_day_delirium': return 'Full Day — Delirium Dive';
    case 'half_day_delirium': return 'Half Day — Delirium Dive';
    case 'full_day_kids': return 'Full Day (Kids)';
    case 'half_day_kids': return 'Half Day (Kids)';
    default: return format;
  }
}

export function skillLevelLabel(level: string): string {
  switch (level) {
    case 'never_skied': return 'Never Skied';
    case 'once_or_twice': return 'Once or Twice';
    case 'green_runner': return 'Green Runner';
    case 'blue_runner': return 'Blue Runner';
    case 'black_runner': return 'Black Runner';
    default: return level;
  }
}
