import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { calculateProjectedBalance } from '@/utils/pto-calc';
import { format, addMonths } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ListTree, PlusCircle, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Timeline() {
  const reset = useLiveQuery(() => db.resets.toCollection().last());
  const entries = useLiveQuery(() => db.entries.toArray());

  if (!reset) return null;

  // Show timeline for next 6 months
  const targetDate = format(addMonths(new Date(), 6), 'yyyy-MM-dd');
  const { timeline } = calculateProjectedBalance(reset, entries || [], targetDate);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTree className="w-5 h-5" />
          Timeline (Next 6 Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeline.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No upcoming events in the next 6 months.
            </div>
          ) : (
            timeline.map((event, idx) => (
              <div key={`${event.date}-${event.type}-${idx}`} className="flex gap-4 items-start">
                <div className="mt-1 flex-shrink-0">
                  {event.type === 'accrual' ? (
                    <PlusCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <MinusCircle className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 pb-4 border-b last:border-0 border-muted">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-sm sm:text-base">{event.description}</div>
                    <div className="text-sm font-mono font-bold">{event.balanceAfter.toFixed(2)}h</div>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm text-muted-foreground">
                    <div>{format(new Date(event.date + 'T00:00:00'), 'MMM d, yyyy')}</div>
                    <div className={cn(
                      "font-medium",
                      event.type === 'accrual' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                    )}>
                      {event.type === 'accrual' ? '+' : '-'}{event.amount.toFixed(2)}h
                      {event.lostAmount! > 0 && (
                        <span className="text-destructive ml-1 sm:ml-2">
                          (Lost {event.lostAmount!.toFixed(2)}h to cap)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
