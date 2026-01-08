import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, X, RotateCcw, FileCheck, Database 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type FileFormat = 'excel' | 'mdb';

interface FileUploadProps {
  file: File | null;
  isParsing: boolean;
  parseError: string | null;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, format: FileFormat) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>, format: FileFormat) => void;
  onReset: () => void;
  hasData: boolean;
  selectedFormat?: FileFormat;
  onFormatChange?: (format: FileFormat) => void;
}

const formatConfig = {
  excel: {
    accept: '.xlsx,.xls,.csv',
    label: 'Excel / CSV',
    description: 'Excel (.xlsx, .xls) or CSV format',
    icon: FileSpreadsheet,
    dropText: 'Drop your Excel file here',
    browseText: 'Browse Files',
  },
  mdb: {
    accept: '.mdb,.accdb',
    label: 'Access DB',
    description: 'Microsoft Access (.mdb, .accdb) format',
    icon: Database,
    dropText: 'Drop your Access database here',
    browseText: 'Browse Databases',
  },
};

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
  selectedFormat = 'excel',
  onFormatChange,
}: FileUploadProps) {
  const [activeTab, setActiveTab] = useState<FileFormat>(selectedFormat);
  const config = formatConfig[activeTab];
  const Icon = config.icon;

  const handleTabChange = (value: string) => {
    const newFormat = value as FileFormat;
    setActiveTab(newFormat);
    onFormatChange?.(newFormat);
  };

  const handleDrop = (e: React.DragEvent) => {
    onDrop(e, activeTab);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e, activeTab);
  };

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
                <Icon className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">Upload Student Data</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
          {file && !parseError && (
            <Button variant="ghost" size="icon" onClick={onReset} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Format Selection Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="excel" className="gap-2" disabled={!!file}>
              <FileSpreadsheet className="h-4 w-4" />
              Excel / CSV
            </TabsTrigger>
            <TabsTrigger value="mdb" className="gap-2" disabled={!!file}>
              <Database className="h-4 w-4" />
              Access DB (.mdb)
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Drop Zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={handleDrop}
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
                  accept={config.accept}
                  className="hidden"
                  onChange={handleFileSelect}
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
                  accept={config.accept}
                  className="hidden"
                  onChange={handleFileSelect}
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
                  {config.dropText}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse • Max 10MB
                </p>
              </div>
              <label className="cursor-pointer inline-block">
                <input
                  type="file"
                  accept={config.accept}
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button variant="outline" asChild>
                  <span>
                    <Icon className="h-4 w-4 mr-2" />
                    {config.browseText}
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
