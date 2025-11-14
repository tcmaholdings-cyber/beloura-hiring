import { useEffect, useState } from 'react';
import { Modal } from '../../components/Modal';
import { TextareaField } from '../../components/TextareaField';
import { LikertScale } from '../../components/LikertScale';
import { Button } from '../../components/Button';

export interface CandidateFeedbackTarget {
  id: string;
  name: string;
  interviewRating: number | null;
  notes: string | null;
}

interface CandidateFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateFeedbackTarget | null;
  onSubmit: (data: { interviewRating: number | null; notes: string | null }) => Promise<void>;
  isSubmitting: boolean;
  error?: string;
}

export function CandidateFeedbackModal({
  isOpen,
  onClose,
  candidate,
  onSubmit,
  isSubmitting,
  error,
}: CandidateFeedbackModalProps) {
  const [rating, setRating] = useState<number | null>(candidate?.interviewRating ?? null);
  const [notes, setNotes] = useState(candidate?.notes ?? '');

  useEffect(() => {
    setRating(candidate?.interviewRating ?? null);
    setNotes(candidate?.notes ?? '');
  }, [candidate, isOpen]);

  if (!candidate) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      interviewRating: rating,
      notes: notes.trim() ? notes.trim() : null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Interview Notes · ${candidate.name}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            Save feedback
          </Button>
        </>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Likert rating (1 = highest, 5 = lowest)</h4>
          <LikertScale value={rating} onChange={setRating} onClear={() => setRating(null)} />
        </div>

        <TextareaField
          label="Real-time interview notes"
          placeholder="Capture interviewer observations, strengths, risks, or follow-ups..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          helperText="These notes are visible to the hiring team as soon as you save."
          disabled={isSubmitting}
        />
      </form>
    </Modal>
  );
}
