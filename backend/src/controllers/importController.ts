import { Request, Response } from 'express';
import {
  parseExcelFile,
  importCandidates,
  validateCandidateData,
} from '../services/excelImportService';

/**
 * Preview Excel file contents without importing
 */
export const previewImport = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const candidates = parseExcelFile(req.file.buffer);

    // Validate all candidates
    const validationResults = candidates.map((candidate, index) => ({
      row: index + 2, // Excel row (accounting for header)
      data: candidate,
      valid: validateCandidateData(candidate) === null,
      error: validateCandidateData(candidate),
    }));

    const validCount = validationResults.filter((r) => r.valid).length;
    const invalidCount = validationResults.filter((r) => !r.valid).length;

    res.json({
      success: true,
      preview: {
        totalRows: candidates.length,
        validRows: validCount,
        invalidRows: invalidCount,
        candidates: validationResults,
      },
    });
  } catch (error) {
    console.error('Preview import error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to preview file',
    });
  }
};

/**
 * Import candidates from Excel file
 */
export const executeImport = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const candidates = parseExcelFile(req.file.buffer);

    if (candidates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid data found in Excel file',
      });
    }

    const result = await importCandidates(candidates);

    res.json({
      success: result.success,
      message: `Import completed. ${result.imported} candidates imported, ${result.failed} failed.`,
      result,
    });
  } catch (error) {
    console.error('Execute import error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to import candidates',
    });
  }
};

/**
 * Download Excel template for candidate import
 */
export const downloadTemplate = (_req: Request, res: Response) => {
  const templateData = {
    headers: [
      'Name',
      'Telegram',
      'Country',
      'Timezone',
      'Source',
      'Referrer',
      'Stage',
      'Owner',
      'Rating',
      'Notes',
    ],
    example: [
      'John Doe',
      '@johndoe',
      'United States',
      'America/New_York',
      'LinkedIn',
      'Jane Smith',
      'screening',
      'hr_managers',
      '4',
      'Strong technical background',
    ],
    stages: [
      'new',
      'screening',
      'interviewing',
      'technical_assessment',
      'final_review',
      'offer',
      'hired',
      'rejected',
    ],
    owners: ['hr_managers', 'chatting_managers', 'ops_managers'],
  };

  res.json({
    success: true,
    template: templateData,
    instructions: {
      name: 'Required. Full name of the candidate.',
      telegram: 'Optional. Telegram handle (with or without @).',
      country: 'Optional. Country of residence.',
      timezone: 'Optional. Timezone (e.g., America/New_York).',
      source: 'Optional. How the candidate was found.',
      referrer: 'Optional. Who referred the candidate.',
      stage: 'Optional. Current pipeline stage (see allowed values).',
      owner: 'Optional. Current owner role (see allowed values).',
      rating: 'Optional. Interview rating (1-5).',
      notes: 'Optional. Additional notes or comments.',
    },
  });
};
