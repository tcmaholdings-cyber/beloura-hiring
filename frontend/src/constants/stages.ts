import type { CandidateStage } from '../types';

export const STAGE_ORDER: CandidateStage[] = [
  'new',
  'qualifying',
  'interview_scheduled',
  'interview_done',
  'tests_scheduled',
  'tests_done',
  'mock_scheduled',
  'mock_done',
  'onboarding_assigned',
  'onboarding_done',
  'probation_start',
  'probation_end',
];

export const STAGE_LABELS: Record<CandidateStage, string> = {
  new: 'New',
  qualifying: 'Qualifying',
  interview_scheduled: 'Interview Scheduled',
  interview_done: 'Interview Done',
  tests_scheduled: 'Tests Scheduled',
  tests_done: 'Tests Done',
  mock_scheduled: 'Mock Scheduled',
  mock_done: 'Mock Done',
  onboarding_assigned: 'Onboarding Assigned',
  onboarding_done: 'Onboarding Done',
  probation_start: 'Probation Start',
  probation_end: 'Probation End',
};

export const STAGE_COLORS: Record<CandidateStage, string> = {
  new: 'bg-blue-500',
  qualifying: 'bg-indigo-500',
  interview_scheduled: 'bg-purple-500',
  interview_done: 'bg-pink-500',
  tests_scheduled: 'bg-red-500',
  tests_done: 'bg-orange-500',
  mock_scheduled: 'bg-amber-500',
  mock_done: 'bg-yellow-500',
  onboarding_assigned: 'bg-lime-500',
  onboarding_done: 'bg-green-500',
  probation_start: 'bg-emerald-500',
  probation_end: 'bg-teal-500',
};
