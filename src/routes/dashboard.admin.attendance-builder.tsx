import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Save, ListPlus, Download, Upload, GripVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { customPrompt } from '@/lib/customModal';

export const Route = createFileRoute('/dashboard/admin/attendance-builder')({
  component: AttendanceBuilder,
});

const DEFAULT_FIELDS = [
  { id: '1', name: 'Date', required: true },
  { id: '2', name: 'Staff ID', required: true },
  { id: '3', name: 'Full Name', required: true },
  { id: '4', name: 'Department', required: true },
  { id: '5', name: 'Time In', required: true },
  { id: '6', name: 'Time Out', required: false },
  { id: '7', name: 'Signature', required: true },
];

function AttendanceBuilder() {
  const [fields, setFields] = useState(DEFAULT_FIELDS);

  const handleAddField = async () => {
    const name = await customPrompt("Enter new field name (e.g., Remarks, Shift):");
    if (name) {
      setFields([...fields, { id: Math.random().toString(), name, required: false }]);
    }
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleToggleRequired = (id: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, required: !f.required } : f));
  };

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Register Builder</h1>
        <p className="text-muted-foreground mt-1">Design the exact Excel/CSV template required for daily attendance uploads.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle className="flex items-center gap-2"><ListPlus className="size-5 text-primary" /> Template Fields</CardTitle>
              <CardDescription>Drag to reorder fields or click to modify requirements.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center justify-between p-3 bg-muted/30 border border-border/50 rounded-lg group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <GripVertical className="size-5 text-muted-foreground cursor-move opacity-50 hover:opacity-100" />
                    <span className="font-semibold">{index + 1}.</span>
                    <span className="font-medium">{field.name}</span>
                    {field.required && <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Required</span>}
                  </div>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleToggleRequired(field.id)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Toggle Required
                    </button>
                    <button onClick={() => handleRemoveField(field.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button 
                onClick={handleAddField}
                className="w-full py-3 mt-4 border-2 border-dashed border-border/80 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors flex items-center justify-center gap-2"
              >
                <ListPlus className="size-4" /> Add Custom Field
              </button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle className="text-lg">Template Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <button className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm hover:bg-primary/90">
                <Save className="size-4" /> Save Template
              </button>
              <button className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                <Download className="size-4" /> Download Empty CSV
              </button>
              <button className="w-full py-2.5 border border-border bg-card hover:bg-muted font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                <Upload className="size-4" /> Import Template JSON
              </button>
            </CardContent>
          </Card>

          <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
            <CardContent className="p-4 flex gap-3">
              <Settings className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-700">Strict Enforcement</h4>
                <p className="text-xs text-amber-700/80 mt-1">If enabled, any uploaded attendance sheet that does not match this exact sequence and naming convention will be rejected.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
