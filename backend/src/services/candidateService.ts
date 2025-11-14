import { prisma } from '../index';
import type { Candidate, Source, Referrer } from '@prisma/client';
import { PipelineStage, OwnerRole, Prisma } from '@prisma/client';

// Input types
export interface CreateCandidateInput {
  name: string;
  telegram?: string;
  country?: string;
  timezone?: string;
  sourceId?: string;
  referrerId?: string;
  currentStage?: PipelineStage;
  currentOwner?: OwnerRole;
  interviewRating?: number;
  notes?: string | null;
}

export interface UpdateCandidateInput {
  name?: string;
  telegram?: string;
  country?: string;
  timezone?: string;
  sourceId?: string;
  referrerId?: string;
  currentStage?: PipelineStage;
  currentOwner?: OwnerRole;
  interviewRating?: number | null;
  notes?: string | null;
}

export interface CandidateFilters {
  currentStage?: PipelineStage;
  currentOwner?: OwnerRole;
  sourceId?: string;
  referrerId?: string;
  search?: string;
  interviewRating?: number;
  minInterviewRating?: number;
  maxInterviewRating?: number;
  hasInterviewRating?: boolean;
  createdAt?: {
    from?: Date;
    to?: Date;
  };
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'currentStage' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CandidateWithRelations extends Candidate {
  source?: Source | null;
  referrer?: Referrer | null;
}

export interface CandidateListResponse {
  data: CandidateWithRelations[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Create a new candidate
 */
export const createCandidate = async (
  input: CreateCandidateInput
): Promise<CandidateWithRelations> => {
  // Validate stage if provided
  if (input.currentStage && !Object.values(PipelineStage).includes(input.currentStage)) {
    throw new Error(`Invalid stage: ${input.currentStage}`);
  }

  // Validate owner role if provided
  if (input.currentOwner && !Object.values(OwnerRole).includes(input.currentOwner)) {
    throw new Error(`Invalid owner role: ${input.currentOwner}`);
  }

  // Validate rating if provided
  if (input.interviewRating !== undefined && input.interviewRating !== null) {
    if (
      !Number.isInteger(input.interviewRating) ||
      input.interviewRating < 1 ||
      input.interviewRating > 5
    ) {
      throw new Error('Interview rating must be an integer between 1 and 5');
    }
  }

  // Validate source exists if provided
  if (input.sourceId) {
    const source = await prisma.source.findUnique({
      where: { id: input.sourceId },
    });
    if (!source) {
      throw new Error(`Source not found: ${input.sourceId}`);
    }
  }

  // Validate referrer exists if provided
  if (input.referrerId) {
    const referrer = await prisma.referrer.findUnique({
      where: { id: input.referrerId },
    });
    if (!referrer) {
      throw new Error(`Referrer not found: ${input.referrerId}`);
    }
  }

  // Create candidate
  const candidate = await prisma.candidate.create({
    data: {
      name: input.name,
      telegram: input.telegram,
      country: input.country,
      timezone: input.timezone,
      sourceId: input.sourceId,
      referrerId: input.referrerId,
      currentStage: input.currentStage || PipelineStage.new,
      currentOwner: input.currentOwner,
      interviewRating: input.interviewRating ?? null,
      notes: input.notes,
    },
    include: {
      source: true,
      referrer: true,
    },
  });

  return candidate;
};

/**
 * Get candidate by ID
 */
export const getCandidateById = async (
  id: string
): Promise<CandidateWithRelations | null> => {
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      source: true,
      referrer: true,
    },
  });

  return candidate;
};

/**
 * List candidates with filters, pagination, and sorting
 */
export const listCandidates = async (
  filters: CandidateFilters = {},
  pagination: PaginationOptions = {}
): Promise<CandidateListResponse> => {
  const {
    limit = 20,
    offset = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = pagination;

  // Build where clause
  const where: any = {};

  if (filters.currentStage) {
    where.currentStage = filters.currentStage;
  }

  if (filters.currentOwner) {
    where.currentOwner = filters.currentOwner;
  }

  if (filters.sourceId) {
    where.sourceId = filters.sourceId;
  }

  if (filters.referrerId) {
    where.referrerId = filters.referrerId;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { telegram: { contains: filters.search, mode: 'insensitive' } },
      { country: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Interview rating filtering
  if (
    filters.interviewRating !== undefined ||
    filters.minInterviewRating !== undefined ||
    filters.maxInterviewRating !== undefined ||
    filters.hasInterviewRating !== undefined
  ) {
    if (filters.hasInterviewRating === false) {
      where.interviewRating = null;
    } else {
      const ratingFilter: any = {};
      if (filters.interviewRating !== undefined) {
        ratingFilter.equals = filters.interviewRating;
      }
      if (filters.minInterviewRating !== undefined) {
        ratingFilter.gte = filters.minInterviewRating;
      }
      if (filters.maxInterviewRating !== undefined) {
        ratingFilter.lte = filters.maxInterviewRating;
      }
      if (filters.hasInterviewRating === true) {
        ratingFilter.not = null;
      }
      if (Object.keys(ratingFilter).length > 0) {
        where.interviewRating = ratingFilter;
      }
    }
  }

  if (filters.createdAt) {
    where.createdAt = {};
    if (filters.createdAt.from) {
      where.createdAt.gte = filters.createdAt.from;
    }
    if (filters.createdAt.to) {
      where.createdAt.lte = filters.createdAt.to;
    }
  }

  // Execute query with count
  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      include: {
        source: true,
        referrer: true,
      },
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset,
    }),
    prisma.candidate.count({ where }),
  ]);

  return {
    data: candidates,
    total,
    limit,
    offset,
  };
};

/**
 * Update candidate
 */
export const updateCandidate = async (
  id: string,
  input: UpdateCandidateInput
): Promise<CandidateWithRelations> => {
  // Check candidate exists
  const existing = await prisma.candidate.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Candidate not found');
  }

  // Validate stage if provided
  if (input.currentStage && !Object.values(PipelineStage).includes(input.currentStage)) {
    throw new Error(`Invalid stage: ${input.currentStage}`);
  }

  // Validate owner role if provided
  if (input.currentOwner && !Object.values(OwnerRole).includes(input.currentOwner)) {
    throw new Error(`Invalid owner role: ${input.currentOwner}`);
  }

  // Validate rating if provided
  if (input.interviewRating !== undefined && input.interviewRating !== null) {
    if (
      !Number.isInteger(input.interviewRating) ||
      input.interviewRating < 1 ||
      input.interviewRating > 5
    ) {
      throw new Error('Interview rating must be an integer between 1 and 5');
    }
  }

  // Validate source exists if provided
  if (input.sourceId) {
    const source = await prisma.source.findUnique({
      where: { id: input.sourceId },
    });
    if (!source) {
      throw new Error(`Source not found: ${input.sourceId}`);
    }
  }

  // Validate referrer exists if provided
  if (input.referrerId) {
    const referrer = await prisma.referrer.findUnique({
      where: { id: input.referrerId },
    });
    if (!referrer) {
      throw new Error(`Referrer not found: ${input.referrerId}`);
    }
  }

  // Update candidate
  const candidate = await prisma.candidate.update({
    where: { id },
    data: input,
    include: {
      source: true,
      referrer: true,
    },
  });

  return candidate;
};

/**
 * Update candidate feedback (notes and interview rating)
 */
export const updateCandidateFeedback = async (
  id: string,
  input: { interviewRating?: number | null; notes?: string | null }
): Promise<CandidateWithRelations> => {
  // Validate rating
  if (input.interviewRating !== undefined && input.interviewRating !== null) {
    if (
      !Number.isInteger(input.interviewRating) ||
      input.interviewRating < 1 ||
      input.interviewRating > 5
    ) {
      throw new Error('Interview rating must be an integer between 1 and 5');
    }
  }

  try {
    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        interviewRating: input.interviewRating ?? null,
        notes: input.notes ?? null,
      },
      include: {
        source: true,
        referrer: true,
      },
    });

    return candidate;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new Error('Candidate not found');
    }
    throw error;
  }
};

/**
 * Delete candidate
 */
export const deleteCandidate = async (id: string): Promise<void> => {
  // Check candidate exists
  const existing = await prisma.candidate.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Candidate not found');
  }

  // Delete candidate
  await prisma.candidate.delete({
    where: { id },
  });
};

/**
 * Bulk update candidate stages
 */
export const bulkUpdateStages = async (
  candidateIds: string[],
  stage: PipelineStage
): Promise<number> => {
  // Validate stage
  if (!Object.values(PipelineStage).includes(stage)) {
    throw new Error(`Invalid stage: ${stage}`);
  }

  // Update candidates
  const result = await prisma.candidate.updateMany({
    where: {
      id: { in: candidateIds },
    },
    data: { currentStage: stage },
  });

  return result.count;
};

/**
 * Get candidate statistics
 */
export const getCandidateStats = async (): Promise<{
  totalCandidates: number;
  byStage: Record<PipelineStage, number>;
  byOwner: Record<OwnerRole, number>;
  recentCandidates: CandidateWithRelations[];
  stageSummaries: Record<
    PipelineStage,
    {
      count: number;
      candidates: Array<{
        id: string;
        name: string;
        telegram: string | null;
        currentOwner: OwnerRole | null;
        interviewRating: number | null;
        notes: string | null;
        updatedAt: Date;
        source?: { id: string; name: string } | null;
      }>;
    }
  >;
}> => {
  const [totalCandidates, stageGroups, ownerGroups, recentCandidates, stageCandidates] =
    await Promise.all([
      prisma.candidate.count(),
      prisma.candidate.groupBy({
        by: ['currentStage'],
        _count: true,
      }),
      prisma.candidate.groupBy({
        by: ['currentOwner'],
        _count: true,
      }),
      prisma.candidate.findMany({
        include: {
          source: true,
          referrer: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.candidate.findMany({
        select: {
          id: true,
          name: true,
          telegram: true,
          currentStage: true,
          currentOwner: true,
          interviewRating: true,
          notes: true,
          updatedAt: true,
          source: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { currentStage: 'asc' },
          { updatedAt: 'desc' },
        ],
      }),
    ]);

  const byStage: Record<PipelineStage, number> = {} as any;
  const stageSummaries: Record<
    PipelineStage,
    {
      count: number;
      candidates: Array<{
        id: string;
        name: string;
        telegram: string | null;
        currentOwner: OwnerRole | null;
        interviewRating: number | null;
        notes: string | null;
        updatedAt: Date;
        source?: { id: string; name: string } | null;
      }>;
    }
  > = {} as any;

  for (const stage of Object.values(PipelineStage)) {
    byStage[stage] = 0;
    stageSummaries[stage] = {
      count: 0,
      candidates: [],
    };
  }

  for (const group of stageGroups) {
    byStage[group.currentStage] = group._count;
  }

  const byOwner: Record<OwnerRole, number> = {
    sourcer: 0,
    interviewer: 0,
    chatting_managers: 0,
  };

  for (const group of ownerGroups) {
    if (group.currentOwner) {
      byOwner[group.currentOwner] = group._count;
    }
  }

  for (const candidate of stageCandidates) {
    const stage = candidate.currentStage;
    stageSummaries[stage].count += 1;
    stageSummaries[stage].candidates.push({
      id: candidate.id,
      name: candidate.name,
      telegram: candidate.telegram,
      currentOwner: candidate.currentOwner,
      interviewRating: candidate.interviewRating,
      notes: candidate.notes,
      updatedAt: candidate.updatedAt,
      source: candidate.source,
    });
  }

  return {
    totalCandidates,
    byStage,
    byOwner,
    recentCandidates,
    stageSummaries,
  };
};
