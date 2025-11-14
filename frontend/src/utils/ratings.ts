export type RatingStatus = 'pass' | 'consideration' | 'borderline' | 'fail' | 'unrated';

const STATUS_BY_SCORE: Record<number, RatingStatus> = {
  1: 'pass',
  2: 'pass',
  3: 'consideration',
  4: 'borderline',
  5: 'fail',
};

const LABEL_BY_SCORE: Record<number, string> = {
  1: 'Excellent (Pass)',
  2: 'Strong (Pass)',
  3: 'For Consideration',
  4: 'Borderline Fail',
  5: 'Failed',
};

const BADGE_STYLES: Record<RatingStatus, string> = {
  pass: 'bg-green-100 text-green-800',
  consideration: 'bg-amber-100 text-amber-800',
  borderline: 'bg-orange-100 text-orange-800',
  fail: 'bg-red-100 text-red-800',
  unrated: 'bg-gray-100 text-gray-700',
};

export function getRatingStatus(value: number | null | undefined): RatingStatus {
  if (!value) {
    return 'unrated';
  }
  return STATUS_BY_SCORE[value] ?? 'unrated';
}

export function getRatingLabel(value: number | null | undefined): string {
  if (!value) {
    return 'Not rated yet';
  }
  return LABEL_BY_SCORE[value] || `Score ${value}`;
}

export function getRatingBadgeClasses(value: number | null | undefined): string {
  const status = getRatingStatus(value);
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${BADGE_STYLES[status]}`;
}

export function isPassingRating(value: number | null | undefined): boolean {
  return value !== null && value !== undefined && value <= 2;
}
