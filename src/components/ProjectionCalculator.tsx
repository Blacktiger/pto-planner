import { useState } from 'react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { calculateProjectedBalance } from '@/utils/pto-calc';
import { useAppSettings } from '@/hooks/useAppSettings';
import { format, addMonths } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';
import { SectionCard } from '@/components/section-card';

export function ProjectionCalculator() {
  const [targetDate, setTargetDate] = useState<string>(
    format(addMonths(new Date(), 3), 'yyyy-MM-dd')
  );

  const reset = useLiveQuery(() => db.resets.orderBy('id').last());
  const entries = useLiveQuery(() => db.entries.toArray());
  const settings = useAppSettings();

  if (!reset) return null;

  const { finalBalance, totalLost } = calculateProjectedBalance(
    reset,
    entries || [],
    targetDate,
    settings
  );

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
