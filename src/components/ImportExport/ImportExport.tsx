import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, AlertCircle } from 'lucide-react';
import { useImportExport } from './useImportExport';

export function ImportExport() {
  const { isExporting, isImporting, handleExport, handleImport } = useImportExport();

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
          <Button 
            onClick={handleExport} 
            variant="outline" 
            className="flex-1 gap-2"
            disabled={isExporting}
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export Backup (JSON)'}
          </Button>
          
          <div className="flex-1 relative">
            <Button variant="outline" className="w-full gap-2" disabled={isImporting}>
              <Upload className="w-4 h-4" />
              {isImporting ? 'Importing...' : 'Import Backup'}
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isImporting}
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
