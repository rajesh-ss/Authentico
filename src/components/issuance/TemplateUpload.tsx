import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, FileCode, Trash2, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarksCardTemplate } from '@/types/issuance';

interface TemplateUploadProps {
  template: MarksCardTemplate | null;
  onUpload: (file: File) => Promise<MarksCardTemplate>;
  onNext: () => void;
  isLoading?: boolean;
}

export function TemplateUpload({ template, onUpload, onNext, isLoading }: TemplateUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.pdf') || file.name.endsWith('.html'))) {
        await onUpload(file);
      }
    },
    [onUpload]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await onUpload(file);
      }
    },
    [onUpload]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Upload Template</h2>
        <p className="text-muted-foreground mt-1">
          Upload your marks card template (PDF or HTML) to define the layout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Template File</CardTitle>
            <CardDescription>Drag and drop or click to upload</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-all",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
                template && "border-success bg-success/5"
              )}
            >
              {template ? (
                <div className="space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{template.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {template.fileType.toUpperCase()} Template
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => window.location.reload()}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Drop your template here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports PDF and HTML formats
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.html"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button variant="outline" asChild>
                        <span>
                          <FileText className="h-4 w-4 mr-2" />
                          Browse Files
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </div>
              <div className="flex items-center gap-1">
                <FileCode className="h-4 w-4" />
                <span>HTML</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Template Preview</CardTitle>
            <CardDescription>
              Preview of your uploaded template
            </CardDescription>
          </CardHeader>
          <CardContent>
            {template ? (
              <iframe
                src={template.fileUrl}
                className="w-full h-[400px] border rounded"
                title="Template Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-lg border-2 border-dashed border-border">
                <p className="text-muted-foreground">Upload a template to see preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!template || isLoading}>
          Continue to Upload Data
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
