import { prisma } from '../index';
import type { Referrer } from '@prisma/client';

// Input types
export interface CreateReferrerInput {
  name: string;
  externalId?: string;
  telegram?: string;
}

export interface UpdateReferrerInput {
  name?: string;
  externalId?: string;
  telegram?: string;
}

export interface ReferrerFilters {
  search?: string;
  externalId?: string;
  createdAt?: {
    from?: Date;
    to?: Date;
  };
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'externalId' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ReferrerWithStats extends Referrer {
  _count?: {
    candidates: number;
    bonuses: number;
  };
}

export interface ReferrerListResponse {
  referrers: ReferrerWithStats[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Create a new referrer
 */
export const createReferrer = async (
  input: CreateReferrerInput
): Promise<ReferrerWithStats> => {
  // Check unique constraint (name + externalId combination)
  if (input.externalId) {
    const existing = await prisma.referrer.findUnique({
      where: {
        name_externalId: {
          name: input.name,
          externalId: input.externalId,
        },
      },
    });

    if (existing) {
      throw new Error(
        `Referrer with name "${input.name}" and external ID "${input.externalId}" already exists`
      );
    }
  }

  // Create referrer
  const referrer = await prisma.referrer.create({
    data: {
      name: input.name,
      externalId: input.externalId,
      telegram: input.telegram,
    },
    include: {
      _count: {
        select: { candidates: true, bonuses: true },
      },
    },
  });

  return referrer;
};

/**
 * Get referrer by ID
 */
export const getReferrerById = async (
  id: string
): Promise<ReferrerWithStats | null> => {
  const referrer = await prisma.referrer.findUnique({
    where: { id },
    include: {
      _count: {
        select: { candidates: true, bonuses: true },
      },
    },
  });

  return referrer;
};

/**
 * Get referrer by external ID
 */
export const getReferrerByExternalId = async (
  externalId: string
): Promise<ReferrerWithStats | null> => {
  const referrer = await prisma.referrer.findFirst({
    where: { externalId },
    include: {
      _count: {
        select: { candidates: true, bonuses: true },
      },
    },
  });

  return referrer;
};

/**
 * List referrers with filters, pagination, and sorting
 */
export const listReferrers = async (
  filters: ReferrerFilters = {},
  pagination: PaginationOptions = {}
): Promise<ReferrerListResponse> => {
  const {
    limit = 20,
    offset = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = pagination;

  // Build where clause
  const where: any = {};

  if (filters.externalId) {
    where.externalId = filters.externalId;
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
      { externalId: { contains: filters.search, mode: 'insensitive' } },
      { telegram: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Execute query with count
  const [referrers, total] = await Promise.all([
    prisma.referrer.findMany({
      where,
      include: {
        _count: {
          select: { candidates: true, bonuses: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset,
    }),
    prisma.referrer.count({ where }),
  ]);

  return {
    referrers,
    total,
    limit,
    offset,
  };
};

/**
 * Update referrer
 */
export const updateReferrer = async (
  id: string,
  input: UpdateReferrerInput
): Promise<ReferrerWithStats> => {
  // Check referrer exists
  const existing = await prisma.referrer.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Referrer not found');
  }

  // Check unique constraint if name or externalId is being updated
  if (
    (input.name && input.name !== existing.name) ||
    (input.externalId && input.externalId !== existing.externalId)
  ) {
    const newName = input.name || existing.name;
    const newExternalId = input.externalId !== undefined ? input.externalId : existing.externalId;

    if (newExternalId) {
      const conflict = await prisma.referrer.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { name: newName },
            { externalId: newExternalId },
          ],
        },
      });

      if (conflict) {
        throw new Error(
          `Referrer with name "${newName}" and external ID "${newExternalId}" already exists`
        );
      }
    }
  }

  // Update referrer
  const referrer = await prisma.referrer.update({
    where: { id },
    data: input,
    include: {
      _count: {
        select: { candidates: true, bonuses: true },
      },
    },
  });

  return referrer;
};

/**
 * Delete referrer
 */
export const deleteReferrer = async (id: string): Promise<void> => {
  // Check referrer exists
  const existing = await prisma.referrer.findUnique({
    where: { id },
    include: {
      _count: {
        select: { candidates: true, bonuses: true },
      },
    },
  });

  if (!existing) {
    throw new Error('Referrer not found');
  }

  // Check if referrer has candidates or bonuses
  if (existing._count.candidates > 0) {
    throw new Error(
      `Cannot delete referrer with ${existing._count.candidates} associated candidates`
    );
  }

  if (existing._count.bonuses > 0) {
    throw new Error(
      `Cannot delete referrer with ${existing._count.bonuses} associated bonuses`
    );
  }

  // Delete referrer
  await prisma.referrer.delete({
    where: { id },
  });
};

/**
 * Get referrer statistics
 */
export const getReferrerStats = async (): Promise<{
  total: number;
  withExternalId: number;
  withTelegram: number;
  topReferrers: Array<{
    id: string;
    name: string;
    candidateCount: number;
    bonusCount: number;
  }>;
}> => {
  const [total, referrers] = await Promise.all([
    prisma.referrer.count(),
    prisma.referrer.findMany({
      include: {
        _count: {
          select: { candidates: true, bonuses: true },
        },
      },
    }),
  ]);

  const withExternalId = referrers.filter((r) => r.externalId).length;
  const withTelegram = referrers.filter((r) => r.telegram).length;

  // Get top referrers by candidate count
  const topReferrers = referrers
    .map((r) => ({
      id: r.id,
      name: r.name,
      candidateCount: r._count.candidates,
      bonusCount: r._count.bonuses,
    }))
    .sort((a, b) => b.candidateCount - a.candidateCount)
    .slice(0, 10);

  return {
    total,
    withExternalId,
    withTelegram,
    topReferrers,
  };
};
