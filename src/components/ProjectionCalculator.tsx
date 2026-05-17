import { useState } from 'react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { calculateProjectedBalance } from '@/utils/pto-calc';
import { format, addMonths } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';

export function ProjectionCalculator() {
  const [targetDate, setTargetDate] = useState<string>(
    format(addMonths(new Date(), 3), 'yyyy-MM-dd')
  );
  
  const reset = useLiveQuery(() => db.resets.toCollection().last());
  const entries = useLiveQuery(() => db.entries.toArray());

  if (!reset) return null;

  const { finalBalance, totalLost } = calculateProjectedBalance(reset, entries || [], targetDate);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Balance Projection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="targetDate">Select Future Date</Label>
          <Input
            id="targetDate"
            type="date"
            value={targetDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Projected Balance</div>
            <div className="text-2xl font-bold">{finalBalance.toFixed(2)}h</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Hours Lost to Cap</div>
            <div className="text-2xl font-bold text-destructive">{totalLost.toFixed(2)}h</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
