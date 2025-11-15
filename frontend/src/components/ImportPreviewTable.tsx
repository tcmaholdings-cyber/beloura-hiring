import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import type { ImportPreviewCandidate } from '../services/importService';

interface ImportPreviewTableProps {
  candidates: ImportPreviewCandidate[];
}

export function ImportPreviewTable({ candidates }: ImportPreviewTableProps) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Row
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Telegram
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Country
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Error
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {candidates.map((candidate) => (
            <tr
              key={candidate.row}
              className={candidate.valid ? '' : 'bg-red-50'}
            >
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {candidate.row}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {candidate.valid ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {candidate.data.name || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {candidate.data.telegram || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {candidate.data.country || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {candidate.data.source || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-red-600">
                {candidate.error || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
