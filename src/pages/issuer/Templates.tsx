import React, { useState, useMemo, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TemplatePreviewDialog } from '@/components/templates/TemplatePreviewDialog';
import { TemplateFieldsEditor } from '@/components/templates/TemplateFieldsEditor';
import { 
  Plus, 
  Search, 
  FileText, 
  Upload, 
  MoreVertical, 
  Eye, 
  Pencil, 
  Trash2, 
  Download,
  FileCode,
  Calendar,
  Layers,
  Copy,
  Star,
  FileUp,
  FileDown,
  Check
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MarksCardTemplate, TemplateExport } from '@/types/issuance';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Mock templates data
const mockTemplates: MarksCardTemplate[] = [
  {
    id: 'tmpl-001',
    name: 'Standard Marks Card 2024',
    fileType: 'pdf',
    fileUrl: '/templates/standard-2024.pdf',
    fields: [
      { id: 'f1', name: 'Student Name', type: 'text', required: true },
      { id: 'f2', name: 'Registration No', type: 'text', required: true },
      { id: 'f3', name: 'Semester', type: 'text', required: true },
      { id: 'f4', name: 'Academic Year', type: 'text', required: true },
    ],
    createdAt: new Date('2024-01-15'),
    isDefault: true,
  },
  {
    id: 'tmpl-002',
    name: 'Engineering Marks Card',
    fileType: 'html',
    fileUrl: '/templates/engineering.html',
    fields: [
      { id: 'f1', name: 'Student Name', type: 'text', required: true },
      { id: 'f2', name: 'USN', type: 'text', required: true },
      { id: 'f3', name: 'Branch', type: 'text', required: true },
    ],
    createdAt: new Date('2024-02-20'),
  },
  {
    id: 'tmpl-003',
    name: 'Diploma Certificate Template',
    fileType: 'pdf',
    fileUrl: '/templates/diploma.pdf',
    fields: [
      { id: 'f1', name: 'Student Name', type: 'text', required: true },
      { id: 'f2', name: 'Course', type: 'text', required: true },
    ],
    createdAt: new Date('2024-03-10'),
  },
];

const Templates = () => {
  const [templates, setTemplates] = useState<MarksCardTemplate[]>(mockTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteTemplate, setDeleteTemplate] = useState<MarksCardTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<MarksCardTemplate | null>(null);
  const [editTemplate, setEditTemplate] = useState<MarksCardTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    fileType: 'pdf' as 'pdf' | 'html',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTemplates = useMemo(() => {
    // Sort templates: default first, then by creation date
    const sorted = [...templates].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    
    return sorted.filter((template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  const defaultTemplate = useMemo(() => 
    templates.find(t => t.isDefault), 
    [templates]
  );

  const handleAddTemplate = () => {
    if (!newTemplate.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    const template: MarksCardTemplate = {
      id: `tmpl-${Date.now()}`,
      name: newTemplate.name,
      fileType: newTemplate.fileType,
      fileUrl: '',
      fields: [],
      createdAt: new Date(),
    };

    setTemplates([template, ...templates]);
    setNewTemplate({ name: '', fileType: 'pdf' });
    setIsAddDialogOpen(false);
    toast.success('Template created successfully');
  };

  const handleDeleteTemplate = () => {
    if (deleteTemplate) {
      setTemplates(templates.filter((t) => t.id !== deleteTemplate.id));
      toast.success('Template deleted successfully');
      setDeleteTemplate(null);
    }
  };

  const handleSaveTemplateFields = (updatedTemplate: MarksCardTemplate) => {
    setTemplates(templates.map((t) => 
      t.id === updatedTemplate.id ? updatedTemplate : t
    ));
    setEditTemplate(null);
  };

  // Clone/Duplicate template
  const handleCloneTemplate = (template: MarksCardTemplate) => {
    const clonedTemplate: MarksCardTemplate = {
      ...template,
      id: `tmpl-${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      isDefault: false, // Clone should not be default
      fields: template.fields.map(field => ({
        ...field,
        id: `f-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    };
    
    setTemplates([clonedTemplate, ...templates]);
    toast.success(`Template "${template.name}" cloned successfully`);
  };

  // Set as default template
  const handleSetDefault = (template: MarksCardTemplate) => {
    setTemplates(templates.map(t => ({
      ...t,
      isDefault: t.id === template.id,
    })));
    toast.success(`"${template.name}" is now the default template`);
  };

  // Export template as JSON
  const handleExportTemplate = (template: MarksCardTemplate) => {
    const exportData: TemplateExport = {
      name: template.name,
      fileType: template.fileType,
      fields: template.fields,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.replace(/\s+/g, '_').toLowerCase()}_template.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Template "${template.name}" exported successfully`);
  };

  // Import template from JSON
  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string) as TemplateExport;
        
        // Validate imported data
        if (!importedData.name || !importedData.fileType || !Array.isArray(importedData.fields)) {
          throw new Error('Invalid template format');
        }

        const newTemplate: MarksCardTemplate = {
          id: `tmpl-${Date.now()}`,
          name: importedData.name,
          fileType: importedData.fileType,
          fileUrl: '',
          fields: importedData.fields.map(field => ({
            ...field,
            id: `f-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          })),
          createdAt: new Date(),
          isDefault: false,
        };

        setTemplates([newTemplate, ...templates]);
        toast.success(`Template "${importedData.name}" imported successfully`);
      } catch {
        toast.error('Failed to import template. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileTypeIcon = (fileType: 'pdf' | 'html') => {
    return fileType === 'pdf' ? FileText : FileCode;
  };

  return (
    <DashboardLayout title="Templates" subtitle="Manage marks card templates">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            {/* Import Template Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportTemplate}
              className="hidden"
            />
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-4 w-4 mr-2" />
              Import
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                  <DialogDescription>
                    Add a new marks card template to the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Standard Marks Card 2024"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fileType">File Type</Label>
                    <Select
                      value={newTemplate.fileType}
                      onValueChange={(value: 'pdf' | 'html') =>
                        setNewTemplate({ ...newTemplate, fileType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Template</SelectItem>
                        <SelectItem value="html">HTML Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Upload Template File</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF or HTML files
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTemplate}>Create Template</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Default Template Info */}
        {defaultTemplate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
            <Star className="h-4 w-4 text-warning fill-warning" />
            <span>Default template:</span>
            <span className="font-medium text-foreground">{defaultTemplate.name}</span>
          </div>
        )}

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="font-medium text-foreground mb-1">No templates found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search query' : 'Create your first marks card template'}
              </p>
              {!searchQuery && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <FileUp className="h-4 w-4 mr-2" />
                    Import Template
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Template
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const FileIcon = getFileTypeIcon(template.fileType);
              return (
                <Card 
                  key={template.id} 
                  className={`group hover:shadow-md transition-shadow ${
                    template.isDefault ? 'ring-2 ring-warning/50 bg-warning/5' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          template.isDefault ? 'bg-warning/20' : 'bg-primary/10'
                        }`}>
                          <FileIcon className={`h-5 w-5 ${
                            template.isDefault ? 'text-warning' : 'text-primary'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base truncate">{template.name}</CardTitle>
                            {template.isDefault && (
                              <Star className="h-4 w-4 text-warning fill-warning flex-shrink-0" />
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {format(template.createdAt, 'MMM d, yyyy')}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPreviewTemplate(template)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditTemplate(template)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Fields
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleCloneTemplate(template)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          {!template.isDefault && (
                            <DropdownMenuItem onClick={() => handleSetDefault(template)}>
                              <Star className="h-4 w-4 mr-2" />
                              Set as Default
                            </DropdownMenuItem>
                          )}
                          {template.isDefault && (
                            <DropdownMenuItem disabled className="text-muted-foreground">
                              <Check className="h-4 w-4 mr-2" />
                              Default Template
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleExportTemplate(template)}>
                            <FileDown className="h-4 w-4 mr-2" />
                            Export as JSON
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download File
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteTemplate(template)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="uppercase text-xs">
                          {template.fileType}
                        </Badge>
                        {template.isDefault && (
                          <Badge variant="warning" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Layers className="h-3 w-3" />
                        {template.fields.length} fields
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTemplate}
        onOpenChange={(open) => !open && setDeleteTemplate(null)}
        title="Delete Template"
        description={`Are you sure you want to delete "${deleteTemplate?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteTemplate}
      />

      {/* Template Preview Dialog */}
      <TemplatePreviewDialog
        template={previewTemplate}
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
      />

      {/* Template Fields Editor Dialog */}
      <TemplateFieldsEditor
        template={editTemplate}
        open={!!editTemplate}
        onOpenChange={(open) => !open && setEditTemplate(null)}
        onSave={handleSaveTemplateFields}
      />
    </DashboardLayout>
  );
};

export default Templates;