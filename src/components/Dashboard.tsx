import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { calculateProjectedBalance, forecastCapDate } from '@/utils/pto-calc';
import { useAppSettings } from '@/hooks/useAppSettings';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StatCard, StatValue } from '@/components/stat-card';
import { Wallet, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Dashboard() {
  const reset = useLiveQuery(() => db.resets.orderBy('id').last());
  const entries = useLiveQuery(() => db.entries.toArray());
  const settings = useAppSettings();

  if (!reset) return null;

  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  const thirtyDaysAgo = subDays(now, 30);
  const capWarningThreshold = settings.maxBalance - 10;

  const { finalBalance } = calculateProjectedBalance(reset, entries || [], today, settings);
  const capDate = forecastCapDate(reset, entries || [], settings);

  const relevantEntries = (entries || [])
    .filter(entry => {
      const endDate = parseISO(entry.endDate);
      return isAfter(endDate, thirtyDaysAgo);
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mx-auto">
      <StatCard
        icon={Wallet}
        label="Current Balance"
        value={<StatValue>{finalBalance.toFixed(2)}h</StatValue>}
        caption={`As of today (${format(new Date(), 'MMM d')})`}
      />

      <StatCard
        icon={TrendingUp}
        label="Cap Forecast"
        value={
          <p className="text-xl font-semibold">
            {capDate ? format(new Date(capDate + 'T00:00:00'), 'MMM d, yyyy') : 'No cap hit'}
          </p>
        }
        caption={`Estimated date hitting ${settings.maxBalance}h`}
      />

      {finalBalance >= capWarningThreshold && (
        <Alert className="md:col-span-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Nearing your PTO cap</AlertTitle>
          <AlertDescription>
            You are approaching the {settings.maxBalance}h cap. Consider planning some PTO.
          </AlertDescription>
        </Alert>
      )}

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Recent & Upcoming PTO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {relevantEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent or upcoming PTO entries.
              </p>
            ) : (
              relevantEntries.map((entry) => {
                const isUpcoming = isAfter(parseISO(entry.startDate), now);
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {format(parseISO(entry.startDate), 'MMM d')}
                        {entry.startDate !== entry.endDate &&
                          ` - ${format(parseISO(entry.endDate), 'MMM d')}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.description || 'PTO'} • {entry.totalHours}h
                      </div>
                    </div>
                    <Badge variant={isUpcoming ? 'default' : 'secondary'}>
                      {isUpcoming ? 'Upcoming' : 'Recent'}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
