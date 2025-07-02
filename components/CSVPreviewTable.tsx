import React from 'react';

interface CSVPreviewTableProps {
  csvRows: string[][]; // Array of CSV rows (arrays of cell values)
  mapping: Record<string, string | null>; // { csvHeader: dbField }
  csvHeaders: string[];
  maxRows?: number;
  conflictRows?: number[]; // Indices of rows with conflicts
  requiredFields?: string[]; // DB fields that are required
}

export const CSVPreviewTable: React.FC<CSVPreviewTableProps> = ({ csvRows, mapping, csvHeaders, maxRows = 10, conflictRows = [], requiredFields = [] }) => {
  // Get the DB fields in the order of the mapping
  const mappedFields = csvHeaders.map(h => mapping[h] || null);
  const dbFieldHeaders = mappedFields;

  return (
    <div className="overflow-x-auto border rounded bg-card mt-4">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            {dbFieldHeaders.map((dbField, i) => (
              <th key={i} className="px-2 py-1 border-b font-semibold text-left">
                {dbField ? dbField : <span className="text-yellow-600">Unmapped</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {csvRows.slice(0, maxRows).map((row, rowIdx) => {
            const isConflict = conflictRows.includes(rowIdx);
            return (
              <tr key={rowIdx} className={isConflict ? 'bg-red-50' : ''}>
                {row.map((cell, colIdx) => {
                  const dbField = mappedFields[colIdx];
                  const isRequired = dbField && requiredFields.includes(dbField);
                  const isMissingRequired = isRequired && (!cell || cell.trim() === '');
                  return (
                    <td
                      key={colIdx}
                      className={`px-2 py-1 border-b ${!dbField ? 'bg-yellow-50 text-yellow-700' : ''} ${isMissingRequired ? 'bg-orange-100 text-orange-700 font-semibold' : ''}`}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}; 