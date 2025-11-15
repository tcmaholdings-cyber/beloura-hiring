import { useCallback, useState } from 'react';
import { CloudArrowUpIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  accept = '.xls,.xlsx',
  maxSize = 10,
  disabled = false,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file type
    const allowedExtensions = accept.split(',').map((ext) => ext.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setError(`Invalid file type. Allowed: ${accept}`);
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxSize) {
      setError(`File too large. Max size: ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        setFile(file);
        onFileSelect(file);
      } else {
        setFile(null);
        onFileSelect(null);
      }
    },
    [onFileSelect, maxSize, accept]
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError(null);
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center
            transition-colors duration-200
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          `}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm text-gray-600">
            <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
          </p>
          <p className="mt-2 text-xs text-gray-500">
            {accept.toUpperCase()} files up to {maxSize}MB
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          {!disabled && (
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Remove file"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
