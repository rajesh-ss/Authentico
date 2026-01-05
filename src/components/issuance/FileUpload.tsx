import React, { useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, X, RotateCcw, FileCheck 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  file: File | null;
  isParsing: boolean;
  parseError: string | null;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  hasData: boolean;
}

export const FileUpload = React.memo(function FileUpload({
  file,
  isParsing,
  parseError,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onReset,
  hasData,
}: FileUploadProps) {
  return (
    <Card className={cn(
      "transition-all duration-300",
      hasData && "ring-2 ring-success/20"
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
              file && !parseError ? "bg-success/10" : "bg-primary/10"
            )}>
              {isParsing ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : file && !parseError ? (
                <FileCheck className="h-5 w-5 text-success" />
              ) : (
                <FileSpreadsheet className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">Upload Student Data</CardTitle>
              <CardDescription>Excel (.xlsx, .xls) or CSV format</CardDescription>
            </div>
          </div>
          {file && !parseError && (
            <Button variant="ghost" size="icon" onClick={onReset} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200",
            isDragOver && "border-primary bg-primary/5 scale-[1.02]",
            !isDragOver && !file && !parseError && "border-border hover:border-primary/50 hover:bg-muted/30",
            file && !parseError && "border-success bg-success/5",
            parseError && "border-destructive bg-destructive/5"
          )}
        >
          {isParsing ? (
            <div className="space-y-3 py-4">
              <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin" />
              <div>
                <p className="font-medium text-foreground">Processing file...</p>
                <p className="text-sm text-muted-foreground">Extracting student records</p>
              </div>
            </div>
          ) : file && !parseError ? (
            <div className="space-y-4">
              <div className="h-12 w-12 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <label className="cursor-pointer inline-block">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={onFileSelect}
                />
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Change File
                  </span>
                </Button>
              </label>
            </div>
          ) : parseError ? (
            <div className="space-y-4">
              <div className="h-12 w-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-destructive">{parseError}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please try again with a valid file
                </p>
              </div>
              <label className="cursor-pointer inline-block">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={onFileSelect}
                />
                <Button variant="outline" size="sm" asChild>
                  <span>Try Again</span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-muted flex items-center justify-center">
                <Upload className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Drop your Excel file here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse • Max 10MB
                </p>
              </div>
              <label className="cursor-pointer inline-block">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={onFileSelect}
                />
                <Button variant="outline" asChild>
                  <span>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Browse Files
                  </span>
                </Button>
              </label>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
