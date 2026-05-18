import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { calculateProjectedBalance } from '@/utils/pto-calc';
import { useAppSettings } from '@/hooks/useAppSettings';
import { format, addMonths } from 'date-fns';
import { ListTree, PlusCircle, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionCard } from '@/components/section-card';

export function Timeline() {
  const reset = useLiveQuery(() => db.resets.orderBy('id').last());
  const entries = useLiveQuery(() => db.entries.toArray());
  const settings = useAppSettings();

  if (!reset) return null;

  const targetDate = format(addMonths(new Date(), 6), 'yyyy-MM-dd');
  const { timeline } = calculateProjectedBalance(reset, entries || [], targetDate, settings);

  return (
    <SectionCard icon={ListTree} title="Timeline (Next 6 Months)">
      <div className="space-y-4">
        {timeline.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No upcoming events in the next 6 months.
          </p>
        ) : (
          timeline.map((event, idx) => (
            <div key={`${event.date}-${event.type}-${idx}`} className="flex items-start gap-4">
              <div className="mt-1 shrink-0">
                {event.type === 'accrual' ? (
                  <PlusCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <MinusCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div className="flex-1 border-b border-muted pb-4 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold sm:text-base">{event.description}</p>
                  <p className="font-mono text-sm font-bold">{event.balanceAfter.toFixed(2)}h</p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground sm:text-sm">
                  <span>{format(new Date(event.date + 'T00:00:00'), 'MMM d, yyyy')}</span>
                  <span
                    className={cn(
                      'font-medium',
                      event.type === 'accrual'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-blue-600 dark:text-blue-400'
                    )}
                  >
                    {event.type === 'accrual' ? '+' : '-'}
                    {event.amount.toFixed(2)}h
                    {(event.lostAmount ?? 0) > 0 && (
                      <span className="ml-1 text-destructive sm:ml-2">
                        (Lost {event.lostAmount!.toFixed(2)}h to cap)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}
