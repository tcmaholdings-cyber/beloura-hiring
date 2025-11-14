import { Button } from '../../components/Button';
import type { CandidateFilters } from '../../types';

interface FilterPreset {
  id: string;
  label: string;
  variant: 'success' | 'secondary' | 'ghost';
  icon: JSX.Element;
  filters: Partial<CandidateFilters>;
  description: string;
}

interface FilterPresetsProps {
  currentFilters: CandidateFilters;
  onApplyPreset: (filters: Partial<CandidateFilters>) => void;
  counts?: Record<string, number>;
}

const CheckCircleIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StarIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const PRESETS: FilterPreset[] = [
  {
    id: 'ready-for-next-stage',
    label: 'Ready for Next Stage',
    variant: 'success',
    icon: <CheckCircleIcon />,
    filters: {
      minInterviewRating: 1,
      maxInterviewRating: 2,
      currentStage: 'interview_done',
    },
    description: 'Candidates rated 1-2 who completed interviews',
  },
  {
    id: 'needs-rating',
    label: 'Needs Rating',
    variant: 'secondary',
    icon: <AlertCircleIcon />,
    filters: {
      hasInterviewRating: false,
    },
    description: 'Candidates without interview ratings',
  },
  {
    id: 'top-performers',
    label: 'Top Performers',
    variant: 'success',
    icon: <StarIcon />,
    filters: {
      interviewRating: 1,
    },
    description: 'Only excellent rated candidates',
  },
  {
    id: 'all-candidates',
    label: 'All Candidates',
    variant: 'ghost',
    icon: <UsersIcon />,
    filters: {},
    description: 'Reset to default view',
  },
];

function isPresetActive(preset: FilterPreset, currentFilters: CandidateFilters): boolean {
  // Special case: "All Candidates" is active when no filters are applied
  if (preset.id === 'all-candidates') {
    return (
      !currentFilters.currentStage &&
      !currentFilters.currentOwner &&
      !currentFilters.sourceId &&
      !currentFilters.interviewRating &&
      !currentFilters.minInterviewRating &&
      !currentFilters.maxInterviewRating &&
      !currentFilters.hasInterviewRating &&
      !currentFilters.search
    );
  }

  // Special case: "Ready for Next Stage" has multiple conditions
  if (preset.id === 'ready-for-next-stage') {
    return (
      currentFilters.minInterviewRating === 1 &&
      currentFilters.maxInterviewRating === 2 &&
      currentFilters.currentStage === 'interview_done' &&
      !currentFilters.interviewRating &&
      !currentFilters.hasInterviewRating
    );
  }

  // Special case: "Needs Rating"
  if (preset.id === 'needs-rating') {
    return (
      currentFilters.hasInterviewRating === false &&
      !currentFilters.minInterviewRating &&
      !currentFilters.maxInterviewRating &&
      !currentFilters.interviewRating
    );
  }

  // Special case: "Top Performers"
  if (preset.id === 'top-performers') {
    return (
      currentFilters.interviewRating === 1 &&
      !currentFilters.minInterviewRating &&
      !currentFilters.maxInterviewRating &&
      !currentFilters.hasInterviewRating
    );
  }

  // Generic check for other presets
  const presetKeys = Object.keys(preset.filters);
  return presetKeys.every((key) => {
    const filterKey = key as keyof CandidateFilters;
    return currentFilters[filterKey] === preset.filters[filterKey];
  });
}

export function FilterPresets({ currentFilters, onApplyPreset, counts }: FilterPresetsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Filters</h3>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const isActive = isPresetActive(preset, currentFilters);
          const count = counts?.[preset.id];

          return (
            <Button
              key={preset.id}
              variant={isActive ? preset.variant : 'ghost'}
              size="sm"
              onClick={() => onApplyPreset(preset.filters)}
              leftIcon={preset.icon}
              className={isActive ? 'ring-2 ring-offset-1' : ''}
              title={preset.description}
            >
              {preset.label}
              {count !== undefined && count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                  isActive
                    ? 'bg-white bg-opacity-30'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {count}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
