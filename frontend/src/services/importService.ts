import { api } from './api';

export interface ImportPreviewCandidate {
  row: number;
  data: {
    name: string;
    telegram?: string;
    country?: string;
    timezone?: string;
    source?: string;
    referrer?: string;
    currentStage?: string;
    currentOwner?: string;
    interviewRating?: number;
    notes?: string;
  };
  valid: boolean;
  error?: string;
}

export interface ImportPreview {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  candidates: ImportPreviewCandidate[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
  candidates?: any[];
}

export interface TemplateData {
  headers: string[];
  example: string[];
  stages: string[];
  owners: string[];
}

/**
 * Download Excel template
 */
export async function downloadTemplate(): Promise<TemplateData> {
  const response = await api.get('/import/template');
  return response.data.template;
}

/**
 * Preview Excel file without importing
 */
export async function previewImport(file: File): Promise<ImportPreview> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/import/preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.preview;
}

/**
 * Execute Excel import
 */
export async function executeImport(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/import/execute', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.result;
}
