import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, GripVertical, Type, Hash, Calendar, Image } from 'lucide-react';
import { MarksCardTemplate, TemplateField } from '@/types/issuance';
import { toast } from 'sonner';

interface TemplateFieldsEditorProps {
  template: MarksCardTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (template: MarksCardTemplate) => void;
}

const fieldTypeIcons = {
  text: Type,
  number: Hash,
  date: Calendar,
  image: Image,
};

const fieldTypeLabels = {
  text: 'Text',
  number: 'Number',
  date: 'Date',
  image: 'Image',
};

export function TemplateFieldsEditor({ template, open, onOpenChange, onSave }: TemplateFieldsEditorProps) {
  const [fields, setFields] = useState<TemplateField[]>(template?.fields || []);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<TemplateField['type']>('text');

  // Reset fields when template changes
  React.useEffect(() => {
    if (template) {
      setFields(template.fields);
    }
  }, [template]);

  if (!template) return null;

  const handleAddField = () => {
    if (!newFieldName.trim()) {
      toast.error('Please enter a field name');
      return;
    }

    if (newFieldName.length > 50) {
      toast.error('Field name must be less than 50 characters');
      return;
    }

    const newField: TemplateField = {
      id: `field-${Date.now()}`,
      name: newFieldName.trim(),
      type: newFieldType,
      required: false,
    };

    setFields([...fields, newField]);
    setNewFieldName('');
    setNewFieldType('text');
  };

  const handleRemoveField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId));
  };

  const handleToggleRequired = (fieldId: string) => {
    setFields(
      fields.map((f) =>
        f.id === fieldId ? { ...f, required: !f.required } : f
      )
    );
  };

  const handleUpdateFieldName = (fieldId: string, name: string) => {
    if (name.length > 50) return;
    setFields(
      fields.map((f) =>
        f.id === fieldId ? { ...f, name } : f
      )
    );
  };

  const handleUpdateFieldType = (fieldId: string, type: TemplateField['type']) => {
    setFields(
      fields.map((f) =>
        f.id === fieldId ? { ...f, type } : f
      )
    );
  };

  const handleSave = () => {
    // Validate all fields have names
    const emptyFields = fields.filter((f) => !f.name.trim());
    if (emptyFields.length > 0) {
      toast.error('All fields must have a name');
      return;
    }

    onSave({
      ...template,
      fields,
    });
    toast.success('Template fields updated successfully');
    onOpenChange(false);
  };

  const FieldTypeIcon = ({ type }: { type: TemplateField['type'] }) => {
    const Icon = fieldTypeIcons[type];
    return <Icon className="h-4 w-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Template Fields</DialogTitle>
          <DialogDescription>
            Configure the fields for "{template.name}". These fields will be mapped to your Excel data during issuance.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 py-4 overflow-hidden">
          {/* Add New Field */}
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="fieldName" className="text-xs">Field Name</Label>
              <Input
                id="fieldName"
                placeholder="e.g., Student Name"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                maxLength={50}
                onKeyDown={(e) => e.key === 'Enter' && handleAddField()}
              />
            </div>
            <div className="w-32 space-y-1.5">
              <Label htmlFor="fieldType" className="text-xs">Type</Label>
              <Select value={newFieldType} onValueChange={(v: TemplateField['type']) => setNewFieldType(v)}>
                <SelectTrigger id="fieldType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddField} size="icon" className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Fields List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Fields ({fields.length})</Label>
              {fields.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {fields.filter((f) => f.required).length} required
                </span>
              )}
            </div>

            {fields.length === 0 ? (
              <div className="border border-dashed rounded-lg p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No fields added yet. Add fields above to define the template structure.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-2 space-y-2">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg group"
                    >
                      <div className="text-muted-foreground cursor-grab">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <span className="text-xs text-muted-foreground w-6">
                        {index + 1}.
                      </span>
                      <Input
                        value={field.name}
                        onChange={(e) => handleUpdateFieldName(field.id, e.target.value)}
                        className="flex-1 h-8 text-sm"
                        maxLength={50}
                      />
                      <Select
                        value={field.type}
                        onValueChange={(v: TemplateField['type']) => handleUpdateFieldType(field.id, v)}
                      >
                        <SelectTrigger className="w-28 h-8">
                          <div className="flex items-center gap-1.5">
                            <FieldTypeIcon type={field.type} />
                            <span className="text-xs">{fieldTypeLabels[field.type]}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">
                            <div className="flex items-center gap-2">
                              <Type className="h-4 w-4" />
                              Text
                            </div>
                          </SelectItem>
                          <SelectItem value="number">
                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4" />
                              Number
                            </div>
                          </SelectItem>
                          <SelectItem value="date">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Date
                            </div>
                          </SelectItem>
                          <SelectItem value="image">
                            <div className="flex items-center gap-2">
                              <Image className="h-4 w-4" />
                              Image
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <Switch
                            id={`required-${field.id}`}
                            checked={field.required}
                            onCheckedChange={() => handleToggleRequired(field.id)}
                            className="scale-75"
                          />
                          <Label
                            htmlFor={`required-${field.id}`}
                            className={`text-xs cursor-pointer ${
                              field.required ? 'text-destructive font-medium' : 'text-muted-foreground'
                            }`}
                          >
                            Required
                          </Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveField(field.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
