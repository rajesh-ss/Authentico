import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { FieldMapping as FieldMappingType, StudentRecord } from '@/types/issuance';
import { cn } from '@/lib/utils';

interface FieldMappingProps {
  headers: string[];
  fieldMappings: FieldMappingType[];
  studentRecords: StudentRecord[];
  onUpdateMapping: (templateField: string, excelColumn: string) => void;
  onValidate: () => StudentRecord[];
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

const requiredFields = ['name', 'regNo', 'semester', 'totalMarks', 'percentage', 'grade'];

export function FieldMapping({
  headers,
  fieldMappings,
  studentRecords,
  onUpdateMapping,
  onValidate,
  onNext,
  onBack,
  isLoading,
}: FieldMappingProps) {
  const validationStats = useMemo(() => {
    const valid = studentRecords.filter((r) => r.isValid).length;
    const invalid = studentRecords.filter((r) => !r.isValid).length;
    return { valid, invalid, total: studentRecords.length };
  }, [studentRecords]);

  const allRequiredMapped = useMemo(() => {
    return requiredFields.every((fieldId) => {
      const mapping = fieldMappings.find((m) => m.templateField === fieldId);
      return mapping && mapping.excelColumn;
    });
  }, [fieldMappings]);

  const handleValidate = () => {
    onValidate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Field Mapping</h2>
        <p className="text-muted-foreground mt-1">
          Map your Excel columns to marks card template fields
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mapping Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Column Mapping
            </CardTitle>
            <CardDescription>
              Select which Excel column corresponds to each template field
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fieldMappings.map((mapping) => {
                const isRequired = requiredFields.includes(mapping.templateField);
                const isMapped = !!mapping.excelColumn;

                return (
                  <div
                    key={mapping.templateField}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg border transition-colors",
                      isMapped ? "border-success/30 bg-success/5" : "border-border"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">
                          {mapping.templateField.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        {isRequired && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        {`{{${mapping.templateField}}}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <Select
                      value={mapping.excelColumn || '__not_mapped__'}
                      onValueChange={(value) =>
                        onUpdateMapping(mapping.templateField, value === '__not_mapped__' ? '' : value)
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__not_mapped__">-- Not Mapped --</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {isMapped && (
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <Button
                onClick={handleValidate}
                disabled={!allRequiredMapped}
                className="w-full"
                variant="outline"
              >
                Validate Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Validation Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Validation Results</CardTitle>
            <CardDescription>
              {studentRecords.length === 0
                ? 'Click "Validate Data" to check records'
                : `${validationStats.valid} of ${validationStats.total} records are valid`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studentRecords.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Map all required fields and validate to see results</p>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{validationStats.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-success/10">
                    <p className="text-2xl font-bold text-success">
                      {validationStats.valid}
                    </p>
                    <p className="text-xs text-muted-foreground">Valid</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-destructive/10">
                    <p className="text-2xl font-bold text-destructive">
                      {validationStats.invalid}
                    </p>
                    <p className="text-xs text-muted-foreground">Errors</p>
                  </div>
                </div>

                {/* Error Records */}
                {validationStats.invalid > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-destructive">
                      Records with errors:
                    </p>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {studentRecords
                          .filter((r) => !r.isValid)
                          .slice(0, 10)
                          .map((record) => (
                            <div
                              key={record.id}
                              className="p-2 rounded border border-destructive/30 bg-destructive/5 text-sm"
                            >
                              <p className="font-medium">
                                {record.name || 'Unknown'} ({record.registrationNumber || 'No Reg'})
                              </p>
                              <ul className="text-xs text-destructive mt-1">
                                {record.errors.map((err, i) => (
                                  <li key={i}>• {err}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Valid Records Preview */}
                {validationStats.valid > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-success mb-2">
                      Valid records preview:
                    </p>
                    <ScrollArea className="h-32">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Reg No</TableHead>
                            <TableHead>Grade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentRecords
                            .filter((r) => r.isValid)
                            .slice(0, 5)
                            .map((record) => (
                              <TableRow key={record.id}>
                                <TableCell className="font-medium">
                                  {record.name}
                                </TableCell>
                                <TableCell>{record.registrationNumber}</TableCell>
                                <TableCell>
                                  <Badge variant="success">{record.grade}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={validationStats.valid === 0 || isLoading}
        >
          Generate {validationStats.valid} Cards
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
