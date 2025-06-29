import React, { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select';
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from './ui/table';
import { AlertCircle } from 'lucide-react';

interface ColumnMappingModalProps {
  csvHeaders: string[];
  dbFields: string[];
  initialMapping?: Record<string, string | null>;
  onMappingChange: (mapping: Record<string, string | null>) => void;
}

export const ColumnMappingModal: React.FC<ColumnMappingModalProps> = ({
  csvHeaders,
  dbFields,
  initialMapping = {},
  onMappingChange,
}) => {
  const [mapping, setMapping] = useState<Record<string, string | null>>({
    ...Object.fromEntries(csvHeaders.map(h => [h, null])),
    ...initialMapping,
  });

  const IGNORE_VALUE = '__ignore__';

  const handleMappingChange = (header: string, value: string | null) => {
    const newMapping = { ...mapping, [header]: value === IGNORE_VALUE ? null : value };
    setMapping(newMapping);
    onMappingChange(newMapping);
  };

  const clearMapping = () => {
    const cleared = Object.fromEntries(csvHeaders.map(h => [h, null]));
    setMapping(cleared);
    onMappingChange(cleared);
  };

  return (
    <div className="p-4 border rounded bg-white max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-lg">Map Your File Fields</h2>
        <Button variant="outline" size="sm" onClick={clearMapping} className="text-red-500">Clear Mapping</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Your File Fields</TableHead>
            <TableHead></TableHead>
            <TableHead>Database Fields</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {csvHeaders.map(header => {
            const isUnmapped = !mapping[header];
            return (
              <TableRow key={header}>
                <TableCell className="w-1/3 flex items-center gap-2">
                  <span className="font-mono">{header}</span>
                  {isUnmapped && (
                    <span className="text-yellow-600 flex items-center text-xs ml-2">
                      <AlertCircle className="h-4 w-4 mr-1" /> Unmapped
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center w-8">→</TableCell>
                <TableCell className="w-1/2">
                  <Select
                    value={mapping[header] || IGNORE_VALUE}
                    onValueChange={val => handleMappingChange(header, val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select DB Field or Ignore" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={IGNORE_VALUE}>Ignore</SelectItem>
                      {dbFields.map(field => (
                        <SelectItem key={field} value={field}>{field}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}; 