import * as XLSX from 'xlsx';
import { PrismaClient, PipelineStage, OwnerRole } from '@prisma/client';

const prisma = new PrismaClient();

export interface CandidateImportData {
  name: string;
  telegram?: string;
  country?: string;
  timezone?: string;
  source?: string;
  referrer?: string;
  currentStage?: PipelineStage;
  currentOwner?: OwnerRole;
  interviewRating?: number;
  notes?: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
  candidates?: any[];
}

/**
 * Parse Excel file buffer and extract candidate data
 */
export const parseExcelFile = (buffer: Buffer): CandidateImportData[] => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON with header row
  const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  // Map Excel columns to candidate fields
  const candidates: CandidateImportData[] = rawData.map((row) => ({
    name: row['Name'] || row['name'] || row['Full Name'] || '',
    telegram: row['Telegram'] || row['telegram'] || row['Telegram Handle'] || undefined,
    country: row['Country'] || row['country'] || row['Location'] || undefined,
    timezone: row['Timezone'] || row['timezone'] || row['Time Zone'] || undefined,
    source: row['Source'] || row['source'] || row['How Found'] || undefined,
    referrer: row['Referrer'] || row['referrer'] || row['Referred By'] || undefined,
    currentStage: mapPipelineStage(row['Stage'] || row['stage'] || row['Current Stage']),
    currentOwner: mapOwnerRole(row['Owner'] || row['owner'] || row['Current Owner']),
    interviewRating: parseRating(row['Rating'] || row['rating'] || row['Interview Rating']),
    notes: row['Notes'] || row['notes'] || row['Comments'] || undefined,
  }));

  return candidates;
};

/**
 * Validate candidate data
 */
export const validateCandidateData = (candidate: CandidateImportData): string | null => {
  if (!candidate.name || candidate.name.trim() === '') {
    return 'Name is required';
  }

  if (candidate.interviewRating !== undefined) {
    if (candidate.interviewRating < 1 || candidate.interviewRating > 5) {
      return 'Interview rating must be between 1 and 5';
    }
  }

  return null;
};

/**
 * Import candidates from Excel data to database
 */
export const importCandidates = async (
  candidates: CandidateImportData[]
): Promise<ImportResult> => {
  const result: ImportResult = {
    success: true,
    imported: 0,
    failed: 0,
    errors: [],
    candidates: [],
  };

  for (let i = 0; i < candidates.length; i++) {
    const candidateData = candidates[i];
    const rowNumber = i + 2; // Excel row (accounting for header)

    // Validate candidate data
    const validationError = validateCandidateData(candidateData);
    if (validationError) {
      result.failed++;
      result.errors.push({
        row: rowNumber,
        error: validationError,
      });
      continue;
    }

    try {
      // Find or create source
      let sourceId: string | undefined;
      if (candidateData.source) {
        const source = await prisma.source.findFirst({
          where: { name: candidateData.source },
        });

        if (source) {
          sourceId = source.id;
        } else {
          const newSource = await prisma.source.create({
            data: { name: candidateData.source },
          });
          sourceId = newSource.id;
        }
      }

      // Find or create referrer
      let referrerId: string | undefined;
      if (candidateData.referrer) {
        const referrer = await prisma.referrer.findFirst({
          where: { name: candidateData.referrer },
        });

        if (referrer) {
          referrerId = referrer.id;
        } else {
          const newReferrer = await prisma.referrer.create({
            data: { name: candidateData.referrer },
          });
          referrerId = newReferrer.id;
        }
      }

      // Create candidate
      const candidate = await prisma.candidate.create({
        data: {
          name: candidateData.name,
          telegram: candidateData.telegram,
          country: candidateData.country,
          timezone: candidateData.timezone,
          sourceId,
          referrerId,
          currentStage: candidateData.currentStage || PipelineStage.new,
          currentOwner: candidateData.currentOwner,
          interviewRating: candidateData.interviewRating,
          notes: candidateData.notes,
        },
        include: {
          source: true,
          referrer: true,
        },
      });

      result.imported++;
      result.candidates?.push(candidate);
    } catch (error) {
      result.failed++;
      result.errors.push({
        row: rowNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (result.failed > 0) {
    result.success = false;
  }

  return result;
};

/**
 * Map string values to PipelineStage enum
 */
const mapPipelineStage = (stage: string | undefined): PipelineStage | undefined => {
  if (!stage) return undefined;

  const stageMap: Record<string, PipelineStage> = {
    new: PipelineStage.new,
    screening: PipelineStage.screening,
    interviewing: PipelineStage.interviewing,
    technical_assessment: PipelineStage.technical_assessment,
    final_review: PipelineStage.final_review,
    offer: PipelineStage.offer,
    hired: PipelineStage.hired,
    rejected: PipelineStage.rejected,
  };

  const normalized = stage.toLowerCase().replace(/\s+/g, '_');
  return stageMap[normalized];
};

/**
 * Map string values to OwnerRole enum
 */
const mapOwnerRole = (owner: string | undefined): OwnerRole | undefined => {
  if (!owner) return undefined;

  const ownerMap: Record<string, OwnerRole> = {
    hr_managers: OwnerRole.hr_managers,
    chatting_managers: OwnerRole.chatting_managers,
    ops_managers: OwnerRole.ops_managers,
  };

  const normalized = owner.toLowerCase().replace(/\s+/g, '_');
  return ownerMap[normalized];
};

/**
 * Parse interview rating from various formats
 */
const parseRating = (rating: any): number | undefined => {
  if (rating === undefined || rating === null || rating === '') {
    return undefined;
  }

  const parsed = typeof rating === 'number' ? rating : parseInt(rating, 10);

  if (isNaN(parsed)) {
    return undefined;
  }

  return Math.max(1, Math.min(5, parsed)); // Clamp between 1-5
};
