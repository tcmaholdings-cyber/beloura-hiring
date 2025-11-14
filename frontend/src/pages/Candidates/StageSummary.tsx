import { useState } from 'react';
import type { CandidateStage, CandidateStats, StageSummaryCandidate } from '../../types';
import { STAGE_ORDER, STAGE_LABELS, STAGE_COLORS } from '../../constants/stages';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getRatingBadgeClasses, getRatingLabel } from '../../utils/ratings';

interface StageSummaryProps {
  stats?: CandidateStats;
  isLoading: boolean;
  onOpenFeedback: (candidate: Pick<StageSummaryCandidate, 'id' | 'name' | 'interviewRating' | 'notes'>) => void;
}

export function StageSummary({ stats, isLoading, onOpenFeedback }: StageSummaryProps) {
  const [expandedStage, setExpandedStage] = useState<CandidateStage | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const hasStagesWithCandidates = STAGE_ORDER.some(
    (stage) => stats.stageSummaries?.[stage]?.count > 0
  );

  if (!hasStagesWithCandidates) {
    return null;
  }

  const handleToggle = (stage: CandidateStage) => {
    setExpandedStage((prev) => (prev === stage ? null : stage));
  };

  return (
    <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
      {STAGE_ORDER.map((stage) => {
        const summary = stats.stageSummaries?.[stage];
        if (!summary || summary.count === 0) {
          return null;
        }

        const isExpanded = expandedStage === stage;

        return (
          <div key={stage}>
            <button
              type="button"
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={() => handleToggle(stage)}
              aria-expanded={isExpanded}
            >
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${STAGE_COLORS[stage]}`} aria-hidden="true" />
                <span className="text-sm font-semibold text-gray-900">{STAGE_LABELS[stage]}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-900">{summary.count} candidate{summary.count !== 1 ? 's' : ''}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {isExpanded && (
              <div className="bg-gray-50 px-6 pb-6">
                {summary.candidates.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">No candidates in this stage yet.</p>
                ) : (
                  <div className="space-y-4 mt-4 max-h-80 overflow-y-auto pr-1">
                    {summary.candidates.map((candidate) => (
                      <StageCandidateRow
                        key={candidate.id}
                        candidate={candidate}
                        onOpenFeedback={() =>
                          onOpenFeedback({
                            id: candidate.id,
                            name: candidate.name,
                            interviewRating: candidate.interviewRating,
                            notes: candidate.notes,
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StageCandidateRow({
  candidate,
  onOpenFeedback,
}: {
  candidate: StageSummaryCandidate;
  onOpenFeedback: () => void;
}) {
  const updatedAt = new Date(candidate.updatedAt).toLocaleDateString();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{candidate.name}</p>
          <div className="text-xs text-gray-500 flex flex-wrap gap-3">
            {candidate.source?.name && <span>{candidate.source.name}</span>}
            {candidate.telegram && <span>{candidate.telegram}</span>}
            <span>Updated {updatedAt}</span>
          </div>
        </div>
        <span className={getRatingBadgeClasses(candidate.interviewRating)}>{getRatingLabel(candidate.interviewRating)}</span>
      </div>
      <p className="text-sm text-gray-700 mt-3 break-words whitespace-pre-line">
        {candidate.notes?.trim() ? candidate.notes : <span className="text-gray-500 italic">No notes yet</span>}
      </p>
      <div className="mt-3">
        <Button size="sm" variant="ghost" onClick={onOpenFeedback}>
          Add / edit notes
        </Button>
      </div>
    </div>
  );
}
