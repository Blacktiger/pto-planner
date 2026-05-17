import React from 'react';
import { db } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, AlertCircle } from 'lucide-react';

export function ImportExport() {
  const handleExport = async () => {
    const data = {
      entries: await db.entries.toArray(),
      resets: await db.resets.toArray(),
      settings: await db.settings.toArray(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pto-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Importing will overwrite your current data. Continue?')) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        await db.transaction('rw', db.entries, db.resets, db.settings, async () => {
          await db.entries.clear();
          await db.resets.clear();
          await db.settings.clear();
          
          if (data.entries) await db.entries.bulkAdd(data.entries);
          if (data.resets) await db.resets.bulkAdd(data.resets);
          if (data.settings) await db.settings.bulkAdd(data.settings);
        });
        
        alert('Import successful!');
        window.location.reload();
      } catch (err) {
        alert('Import failed: Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Data Portability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleExport} variant="outline" className="flex-1 gap-2">
            <Download className="w-4 h-4" />
            Export Backup (JSON)
          </Button>
          
          <div className="flex-1 relative">
            <Button variant="outline" className="w-full gap-2">
              <Upload className="w-4 h-4" />
              Import Backup
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Your data is stored locally in your browser. Use export to move your data to another device or create a backup.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
