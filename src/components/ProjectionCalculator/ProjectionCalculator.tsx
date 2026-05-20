import React from 'react';
import { useProjectionCalculator } from './useProjectionCalculator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, AlertTriangle } from 'lucide-react';
import { SectionCard } from '@/components/section-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ProjectionCalculator() {
  const { targetDate, setTargetDate, status, error, data } = useProjectionCalculator();

  if (status === 'error') {
    return (
      <Alert variant="destructive" className="w-full max-w-4xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error loading projection</AlertTitle>
        <AlertDescription>{error?.message || 'Unknown database error'}</AlertDescription>
      </Alert>
    );
  }

  if (status === 'loading' || !data) {
    return null;
  }

  const { finalBalance, totalLost } = data;

  return (
    <SectionCard icon={Calculator} title="Balance Projection">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="targetDate">Select Future Date</Label>
          <Input
            id="targetDate"
            type="date"
            value={targetDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Projected Balance</p>
            <p className="text-2xl font-bold">{finalBalance.toFixed(2)}h</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Hours Lost to Cap</p>
            <p className="text-2xl font-bold text-destructive">{totalLost.toFixed(2)}h</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
