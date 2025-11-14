import { prisma } from '../index';
import type { Source } from '@prisma/client';

// Input types
export interface CreateSourceInput {
  name: string;
  type?: string;
}

export interface UpdateSourceInput {
  name?: string;
  type?: string;
}

export interface SourceFilters {
  search?: string;
  type?: string;
  createdAt?: {
    from?: Date;
    to?: Date;
  };
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'type' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface SourceWithStats extends Source {
  _count?: {
    candidates: number;
  };
  interviewInsights?: SourceInterviewInsights;
}

export interface SourceListResponse {
  data: SourceWithStats[];
  total: number;
  limit: number;
  offset: number;
}

export interface SourceInterviewInsights {
  interviewed: number;
  passed: number;
  failed: number;
}

const PASSING_RATING_MAX = 2;
const FAILING_RATING_MIN = 4;

async function buildInterviewInsights(sourceIds: string[]): Promise<Record<string, SourceInterviewInsights>> {
  if (sourceIds.length === 0) {
    return {};
  }

  const [interviewedCounts, passedCounts, failedCounts] = await Promise.all([
    prisma.candidate.groupBy({
      by: ['sourceId'],
      where: {
        sourceId: { in: sourceIds },
        interviewRating: { not: null },
      },
      _count: { _all: true },
    }),
    prisma.candidate.groupBy({
      by: ['sourceId'],
      where: {
        sourceId: { in: sourceIds },
        interviewRating: { lte: PASSING_RATING_MAX },
      },
      _count: { _all: true },
    }),
    prisma.candidate.groupBy({
      by: ['sourceId'],
      where: {
        sourceId: { in: sourceIds },
        interviewRating: { gte: FAILING_RATING_MIN },
      },
      _count: { _all: true },
    }),
  ]);

  const map: Record<string, SourceInterviewInsights> = {};
  for (const id of sourceIds) {
    map[id] = { interviewed: 0, passed: 0, failed: 0 };
  }

  for (const group of interviewedCounts) {
    if (group.sourceId) {
      map[group.sourceId].interviewed = group._count._all;
    }
  }

  for (const group of passedCounts) {
    if (group.sourceId) {
      map[group.sourceId].passed = group._count._all;
    }
  }

  for (const group of failedCounts) {
    if (group.sourceId) {
      map[group.sourceId].failed = group._count._all;
    }
  }

  return map;
}

async function attachInsightsToSources(sources: SourceWithStats[]): Promise<SourceWithStats[]> {
  const ids = sources.map((source) => source.id);
  const insights = await buildInterviewInsights(ids);

  return sources.map((source) => ({
    ...source,
    interviewInsights: insights[source.id] || { interviewed: 0, passed: 0, failed: 0 },
  }));
}

/**
 * Create a new source
 */
export const createSource = async (
  input: CreateSourceInput
): Promise<SourceWithStats> => {
  // Check if source name already exists
  const existing = await prisma.source.findUnique({
    where: { name: input.name },
  });

  if (existing) {
    throw new Error(`Source with name "${input.name}" already exists`);
  }

  // Create source
  const source = await prisma.source.create({
    data: {
      name: input.name,
      type: input.type,
    },
    include: {
      _count: {
        select: { candidates: true },
      },
    },
  });

  const [sourceWithInsights] = await attachInsightsToSources([source]);

  return sourceWithInsights;
};

/**
 * Get source by ID
 */
export const getSourceById = async (
  id: string
): Promise<SourceWithStats | null> => {
  const source = await prisma.source.findUnique({
    where: { id },
    include: {
      _count: {
        select: { candidates: true },
      },
    },
  });

  if (!source) {
    return null;
  }

  const [sourceWithInsights] = await attachInsightsToSources([source]);
  return sourceWithInsights;
};

/**
 * List sources with filters, pagination, and sorting
 */
export const listSources = async (
  filters: SourceFilters = {},
  pagination: PaginationOptions = {}
): Promise<SourceListResponse> => {
  const {
    limit = 20,
    offset = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = pagination;

  // Build where clause
  const where: any = {};

  if (filters.type) {
    where.type = filters.type;
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

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { type: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Execute query with count
  const [sources, total] = await Promise.all([
    prisma.source.findMany({
      where,
      include: {
        _count: {
          select: { candidates: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset,
    }),
    prisma.source.count({ where }),
  ]);

  const sourcesWithInsights = await attachInsightsToSources(sources);

  return {
    data: sourcesWithInsights,
    total,
    limit,
    offset,
  };
};

/**
 * Update source
 */
export const updateSource = async (
  id: string,
  input: UpdateSourceInput
): Promise<SourceWithStats> => {
  // Check source exists
  const existing = await prisma.source.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Source not found');
  }

  // Check if new name conflicts with another source
  if (input.name && input.name !== existing.name) {
    const nameConflict = await prisma.source.findUnique({
      where: { name: input.name },
    });

    if (nameConflict) {
      throw new Error(`Source with name "${input.name}" already exists`);
    }
  }

  // Update source
  const source = await prisma.source.update({
    where: { id },
    data: input,
    include: {
      _count: {
        select: { candidates: true },
      },
    },
  });

  const [sourceWithInsights] = await attachInsightsToSources([source]);
  return sourceWithInsights;
};

/**
 * Delete source
 */
export const deleteSource = async (id: string): Promise<void> => {
  // Check source exists
  const existing = await prisma.source.findUnique({
    where: { id },
    include: {
      _count: {
        select: { candidates: true },
      },
    },
  });

  if (!existing) {
    throw new Error('Source not found');
  }

  // Check if source has candidates
  if (existing._count.candidates > 0) {
    throw new Error(
      `Cannot delete source with ${existing._count.candidates} associated candidates`
    );
  }

  // Delete source
  await prisma.source.delete({
    where: { id },
  });
};

/**
 * Get source statistics
 */
export const getSourceStats = async (): Promise<{
  total: number;
  byType: Record<string, number>;
  topSources: Array<{ id: string; name: string; candidateCount: number }>;
  interviewSummary: {
    interviewed: number;
    passed: number;
    failed: number;
  };
  bySourceInterview: Array<{
    id: string;
    name: string;
    interviewed: number;
    passed: number;
    failed: number;
  }>;
}> => {
  const [total, sources] = await Promise.all([
    prisma.source.count(),
    prisma.source.findMany({
      include: {
        _count: {
          select: { candidates: true },
        },
        candidates: {
          select: {
            interviewRating: true,
          },
        },
      },
    }),
  ]);

  // Group by type
  const byType: Record<string, number> = {};
  for (const source of sources) {
    const type = source.type || 'unknown';
    byType[type] = (byType[type] || 0) + 1;
  }

  // Get top sources by candidate count
  const topSources = sources
    .map((s) => ({
      id: s.id,
      name: s.name,
      candidateCount: s._count.candidates,
    }))
    .sort((a, b) => b.candidateCount - a.candidateCount)
    .slice(0, 10);

  const interviewSummary = {
    interviewed: 0,
    passed: 0,
    failed: 0,
  };

  const bySourceInterview = sources.map((source) => {
    const interviewed = source.candidates.filter((c) => c.interviewRating !== null).length;
    const passed = source.candidates.filter(
      (c) => c.interviewRating !== null && c.interviewRating <= PASSING_RATING_MAX
    ).length;
    const failed = source.candidates.filter(
      (c) => c.interviewRating !== null && c.interviewRating >= FAILING_RATING_MIN
    ).length;

    interviewSummary.interviewed += interviewed;
    interviewSummary.passed += passed;
    interviewSummary.failed += failed;

    return {
      id: source.id,
      name: source.name,
      interviewed,
      passed,
      failed,
    };
  });

  return {
    total,
    byType,
    topSources,
    interviewSummary,
    bySourceInterview,
  };
};

// Source Analytics Types
export interface SourceAnalytics {
  id: string;
  name: string;
  type: string | null;
  totalCandidates: number;
  interviewMetrics: {
    interviewed: number;
    passed: number;
    consideration: number;
    failed: number;
    notRated: number;
  };
  conversionRates: {
    interviewRate: number;
    passRate: number;
    failRate: number;
    qualityScore: number;
  };
  pipeline: {
    active: number;
    completed: number;
    dropped: number;
  };
}

const CONSIDERATION_RATING = 3;

/**
 * Get comprehensive source analytics
 */
export const getSourceAnalytics = async (): Promise<SourceAnalytics[]> => {
  const sources = await prisma.source.findMany({
    include: {
      candidates: {
        select: {
          id: true,
          interviewRating: true,
          currentStage: true,
          updatedAt: true,
        },
      },
    },
  });

  return sources.map((source) => {
    const candidates = source.candidates;
    const total = candidates.length;

    // Interview metrics
    const interviewed = candidates.filter((c) => c.interviewRating !== null);
    const passed = interviewed.filter((c) => c.interviewRating! <= PASSING_RATING_MAX);
    const consideration = interviewed.filter((c) => c.interviewRating === CONSIDERATION_RATING);
    const failed = interviewed.filter((c) => c.interviewRating! >= FAILING_RATING_MIN);
    const notRated = candidates.filter(
      (c) =>
        ['interview_done', 'tests_done', 'mock_done'].includes(c.currentStage) &&
        c.interviewRating === null
    );

    // Conversion rates
    const interviewRate = total > 0 ? (interviewed.length / total) * 100 : 0;
    const passRate = interviewed.length > 0 ? (passed.length / interviewed.length) * 100 : 0;
    const failRate = interviewed.length > 0 ? (failed.length / interviewed.length) * 100 : 0;
    const qualityScore =
      interviewed.length > 0 ? (passed.length * 2 - failed.length) / interviewed.length : 0;

    // Pipeline metrics
    const active = candidates.filter((c) => c.currentStage !== 'probation_end').length;
    const completed = candidates.filter((c) => c.currentStage === 'probation_end').length;

    // Dropped: candidates with passing ratings (1-2) who haven't been updated in 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dropped = candidates.filter(
      (c) =>
        c.interviewRating !== null &&
        c.interviewRating <= PASSING_RATING_MAX &&
        c.currentStage !== 'probation_end' &&
        c.updatedAt < thirtyDaysAgo
    ).length;

    return {
      id: source.id,
      name: source.name,
      type: source.type,
      totalCandidates: total,
      interviewMetrics: {
        interviewed: interviewed.length,
        passed: passed.length,
        consideration: consideration.length,
        failed: failed.length,
        notRated: notRated.length,
      },
      conversionRates: {
        interviewRate: Math.round(interviewRate * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        failRate: Math.round(failRate * 100) / 100,
        qualityScore: Math.round(qualityScore * 100) / 100,
      },
      pipeline: {
        active,
        completed,
        dropped,
      },
    };
  });
};
