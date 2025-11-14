import type { Request, Response } from 'express';
import {
  createCandidate,
  getCandidateById,
  listCandidates,
  updateCandidate,
  deleteCandidate,
  bulkUpdateStages,
  getCandidateStats,
  updateCandidateFeedback,
  type CreateCandidateInput,
  type UpdateCandidateInput,
  type CandidateFilters,
  type PaginationOptions,
} from '../services/candidateService';
import type { PipelineStage, OwnerRole } from '@prisma/client';

const normalizeNotesInput = (value: unknown): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * Create a new candidate
 * POST /api/v1/candidates
 */
export const createCandidateHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const input: CreateCandidateInput = {
      name: req.body.name,
      telegram: req.body.telegram,
      country: req.body.country,
      timezone: req.body.timezone,
      sourceId: req.body.sourceId,
      referrerId: req.body.referrerId,
      currentStage: req.body.currentStage,
      currentOwner: req.body.currentOwner,
      interviewRating: req.body.interviewRating,
      notes: normalizeNotesInput(req.body.notes),
    };

    const candidate = await createCandidate(input);

    res.status(201).json({
      message: 'Candidate created successfully',
      candidate,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message.includes('Invalid')) {
        res.status(400).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to create candidate' });
  }
};

/**
 * Get candidate by ID
 * GET /api/v1/candidates/:id
 */
export const getCandidateHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const candidate = await getCandidateById(id);

    if (!candidate) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    res.json({ candidate });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
};

/**
 * List candidates with filters, pagination, and search
 * GET /api/v1/candidates
 */
export const listCandidatesHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract filters from query params
    const filters: CandidateFilters = {};

    if (req.query.currentStage) {
      filters.currentStage = req.query.currentStage as PipelineStage;
    }

    if (req.query.currentOwner) {
      filters.currentOwner = req.query.currentOwner as OwnerRole;
    }

    if (req.query.sourceId) {
      filters.sourceId = req.query.sourceId as string;
    }

    if (req.query.referrerId) {
      filters.referrerId = req.query.referrerId as string;
    }

    if (req.query.search) {
      filters.search = req.query.search as string;
    }

    if (req.query.interviewRating) {
      filters.interviewRating = parseInt(req.query.interviewRating as string, 10);
    }

    if (req.query.minInterviewRating) {
      filters.minInterviewRating = parseInt(req.query.minInterviewRating as string, 10);
    }

    if (req.query.maxInterviewRating) {
      filters.maxInterviewRating = parseInt(req.query.maxInterviewRating as string, 10);
    }

    if (req.query.hasInterviewRating !== undefined) {
      filters.hasInterviewRating = req.query.hasInterviewRating === 'true';
    }

    // Handle date range filtering
    if (req.query.createdFrom || req.query.createdTo) {
      filters.createdAt = {};
      if (req.query.createdFrom) {
        filters.createdAt.from = new Date(req.query.createdFrom as string);
      }
      if (req.query.createdTo) {
        filters.createdAt.to = new Date(req.query.createdTo as string);
      }
    }

    // Extract pagination options
    const pagination: PaginationOptions = {};

    if (req.query.limit) {
      pagination.limit = parseInt(req.query.limit as string, 10);
    }

    if (req.query.offset) {
      pagination.offset = parseInt(req.query.offset as string, 10);
    }

    if (req.query.sortBy) {
      pagination.sortBy = req.query.sortBy as any;
    }

    if (req.query.sortOrder) {
      pagination.sortOrder = req.query.sortOrder as 'asc' | 'desc';
    }

    const result = await listCandidates(filters, pagination);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
};

/**
 * Update candidate
 * PATCH /api/v1/candidates/:id
 */
export const updateCandidateHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const input: UpdateCandidateInput = {};

    if (req.body.name !== undefined) {
      input.name = req.body.name;
    }
    if (req.body.telegram !== undefined) {
      input.telegram = req.body.telegram;
    }
    if (req.body.country !== undefined) {
      input.country = req.body.country;
    }
    if (req.body.timezone !== undefined) {
      input.timezone = req.body.timezone;
    }
    if (req.body.sourceId !== undefined) {
      input.sourceId = req.body.sourceId;
    }
    if (req.body.referrerId !== undefined) {
      input.referrerId = req.body.referrerId;
    }
    if (req.body.currentStage !== undefined) {
      input.currentStage = req.body.currentStage;
    }
    if (req.body.currentOwner !== undefined) {
      input.currentOwner = req.body.currentOwner;
    }
    if (req.body.interviewRating !== undefined) {
      input.interviewRating = req.body.interviewRating;
    }
    if (req.body.notes !== undefined) {
      input.notes = normalizeNotesInput(req.body.notes);
    }

    const candidate = await updateCandidate(id, input);

    res.json({
      message: 'Candidate updated successfully',
      candidate,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Candidate not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message.includes('Invalid')) {
        res.status(400).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to update candidate' });
  }
};

/**
 * Delete candidate
 * DELETE /api/v1/candidates/:id
 */
export const deleteCandidateHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await deleteCandidate(id);

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Candidate not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
};

/**
 * Bulk update candidate stages
 * POST /api/v1/candidates/bulk/update-stages
 */
export const bulkUpdateStagesHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { candidateIds, currentStage } = req.body;

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      res.status(400).json({ error: 'candidateIds must be a non-empty array' });
      return;
    }

    if (!currentStage) {
      res.status(400).json({ error: 'currentStage is required' });
      return;
    }

    const count = await bulkUpdateStages(candidateIds, currentStage);

    res.json({
      message: `Updated ${count} candidates successfully`,
      count,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid')) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to update candidates' });
  }
};

/**
 * Get candidate statistics
 * GET /api/v1/candidates/stats
 */
export const getCandidateStatsHandler = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await getCandidateStats();

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidate statistics' });
  }
};

/**
 * Update candidate feedback (notes + rating)
 * PATCH /api/v1/candidates/:id/feedback
 */
export const updateCandidateFeedbackHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { interviewRating } = req.body;
    const notes = normalizeNotesInput(req.body.notes);

    const candidate = await updateCandidateFeedback(id, {
      interviewRating,
      notes,
    });

    res.json({
      message: 'Candidate feedback updated successfully',
      candidate,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('between 1 and 5')) {
        res.status(400).json({ error: error.message });
        return;
      }
      if (error.message === 'Candidate not found') {
        res.status(404).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Failed to update candidate feedback' });
  }
};
