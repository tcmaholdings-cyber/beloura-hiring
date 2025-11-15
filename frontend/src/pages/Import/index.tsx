import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../../components/FileUpload';
import { ImportPreviewTable } from '../../components/ImportPreviewTable';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  previewImport,
  executeImport,
  downloadTemplate,
  type ImportPreview,
  type ImportResult,
} from '../../services/importService';
import { getErrorMessage } from '../../services/api';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function ImportPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      setError(null);

      const template = await downloadTemplate();

      // Create CSV from template data
      const csvContent = [
        template.headers.join(','),
        template.example.join(','),
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'candidate_import_template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handlePreview = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      setPreview(null);

      const previewData = await previewImport(file);
      setPreview(previewData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const importResult = await executeImport(file);
      setResult(importResult);

      if (importResult.success) {
        // Clear preview after successful import
        setPreview(null);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleViewCandidates = () => {
    navigate('/candidates');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Import Candidates</h1>
        <p className="mt-2 text-gray-600">
          Upload an Excel file to bulk import candidate data
        </p>
      </div>

      {/* Template Download Section */}
      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-900">Excel Template</h3>
            <p className="mt-1 text-sm text-blue-700">
              Download the template to ensure your Excel file has the correct format and column headers
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadTemplate}
            disabled={loading}
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Display */}
      {result && result.success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Import Completed Successfully
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {result.imported} candidates imported
                  {result.failed > 0 && `, ${result.failed} failed`}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm" onClick={handleReset}>
                Import More
              </Button>
              <Button variant="primary" size="sm" onClick={handleViewCandidates}>
                View Candidates
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      {!result && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Excel File</h2>

          <FileUpload
            onFileSelect={handleFileSelect}
            accept=".xls,.xlsx"
            maxSize={10}
            disabled={loading}
          />

          {file && !preview && (
            <div className="mt-4">
              <Button
                onClick={handlePreview}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Analyzing File...
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                    Preview Import
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Preview Section */}
      {preview && !result && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Preview</h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Rows</p>
              <p className="text-2xl font-bold text-gray-900">{preview.totalRows}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Valid Rows</p>
              <p className="text-2xl font-bold text-green-600">{preview.validRows}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Invalid Rows</p>
              <p className="text-2xl font-bold text-red-600">{preview.invalidRows}</p>
            </div>
          </div>

          <div className="mb-6">
            <ImportPreviewTable candidates={preview.candidates} />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={handleReset}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={loading || preview.validRows === 0}
              className="flex-1"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  Import {preview.validRows} Candidate{preview.validRows !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>

          {preview.invalidRows > 0 && (
            <p className="mt-4 text-sm text-amber-600">
              Note: {preview.invalidRows} row{preview.invalidRows !== 1 ? 's' : ''} will be
              skipped due to validation errors
            </p>
          )}
        </div>
      )}

      {/* Result Errors */}
      {result && result.errors.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Errors</h2>
          <div className="space-y-2">
            {result.errors.map((err, index) => (
              <div key={index} className="text-sm text-red-600">
                Row {err.row}: {err.error}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
