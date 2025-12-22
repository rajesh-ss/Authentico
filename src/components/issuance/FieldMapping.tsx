import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, ArrowRightLeft, XCircle, Eye, Filter } from 'lucide-react';
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
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'invalid'>('all');

  const validationStats = useMemo(() => {
    const valid = studentRecords.filter((r) => r.isValid).length;
    const invalid = studentRecords.filter((r) => !r.isValid).length;
    return { valid, invalid, total: studentRecords.length };
  }, [studentRecords]);

  const filteredRecords = useMemo(() => {
    if (previewFilter === 'valid') return studentRecords.filter((r) => r.isValid);
    if (previewFilter === 'invalid') return studentRecords.filter((r) => !r.isValid);
    return studentRecords;
  }, [studentRecords, previewFilter]);

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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Validation Preview
                </CardTitle>
                <CardDescription>
                  {studentRecords.length === 0
                    ? 'Click "Validate Data" to check records'
                    : `${validationStats.valid} of ${validationStats.total} records will be processed`}
                </CardDescription>
              </div>
              {studentRecords.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={previewFilter} onValueChange={(v) => setPreviewFilter(v as 'all' | 'valid' | 'invalid')}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All ({validationStats.total})</SelectItem>
                      <SelectItem value="valid">Pass ({validationStats.valid})</SelectItem>
                      <SelectItem value="invalid">Fail ({validationStats.invalid})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {studentRecords.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Map all required fields and validate to see results</p>
              </div>
            ) : (
              <>
                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button
                    onClick={() => setPreviewFilter('all')}
                    className={cn(
                      "text-center p-3 rounded-lg transition-colors",
                      previewFilter === 'all' ? "bg-primary/20 ring-2 ring-primary" : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <p className="text-2xl font-bold">{validationStats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Records</p>
                  </button>
                  <button
                    onClick={() => setPreviewFilter('valid')}
                    className={cn(
                      "text-center p-3 rounded-lg transition-colors",
                      previewFilter === 'valid' ? "bg-success/20 ring-2 ring-success" : "bg-success/10 hover:bg-success/20"
                    )}
                  >
                    <p className="text-2xl font-bold text-success">
                      {validationStats.valid}
                    </p>
                    <p className="text-xs text-muted-foreground">Will Pass</p>
                  </button>
                  <button
                    onClick={() => setPreviewFilter('invalid')}
                    className={cn(
                      "text-center p-3 rounded-lg transition-colors",
                      previewFilter === 'invalid' ? "bg-destructive/20 ring-2 ring-destructive" : "bg-destructive/10 hover:bg-destructive/20"
                    )}
                  >
                    <p className="text-2xl font-bold text-destructive">
                      {validationStats.invalid}
                    </p>
                    <p className="text-xs text-muted-foreground">Will Fail</p>
                  </button>
                </div>

                {/* Records Table */}
                <ScrollArea className="h-[280px] rounded-md border">
                  <TooltipProvider>
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="w-12">Status</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Reg No</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead className="text-right">Issues</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No records match the current filter
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRecords.map((record) => (
                            <TableRow 
                              key={record.id}
                              className={cn(
                                record.isValid 
                                  ? "bg-success/5 hover:bg-success/10" 
                                  : "bg-destructive/5 hover:bg-destructive/10"
                              )}
                            >
                              <TableCell>
                                {record.isValid ? (
                                  <CheckCircle className="h-5 w-5 text-success" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-destructive" />
                                )}
                              </TableCell>
                              <TableCell className="font-medium">
                                {record.name || <span className="text-muted-foreground italic">Missing</span>}
                              </TableCell>
                              <TableCell>
                                {record.registrationNumber || <span className="text-muted-foreground italic">Missing</span>}
                              </TableCell>
                              <TableCell>
                                {record.grade ? (
                                  <Badge variant={record.isValid ? "success" : "secondary"}>
                                    {record.grade}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground italic">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {record.errors.length > 0 ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="destructive" className="cursor-help">
                                        {record.errors.length} {record.errors.length === 1 ? 'issue' : 'issues'}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="max-w-xs">
                                      <ul className="text-xs space-y-1">
                                        {record.errors.map((err, i) => (
                                          <li key={i}>• {err}</li>
                                        ))}
                                      </ul>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <Badge variant="success">Ready</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TooltipProvider>
                </ScrollArea>

                {/* Summary message */}
                {validationStats.invalid > 0 && (
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Records with errors will be skipped during card generation
                  </p>
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
