import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { calculateProjectedBalance, forecastCapDate } from '@/utils/pto-calc';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wallet, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Dashboard() {
  const reset = useLiveQuery(() => db.resets.orderBy('id').last());
  const entries = useLiveQuery(() => db.entries.toArray());

  if (!reset) return null;

  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  const thirtyDaysAgo = subDays(now, 30);
  
  const { finalBalance } = calculateProjectedBalance(reset, entries || [], today);
  const capDate = forecastCapDate(reset, entries || []);

  const relevantEntries = (entries || [])
    .filter(entry => {
      const endDate = parseISO(entry.endDate);
      return isAfter(endDate, thirtyDaysAgo);
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{finalBalance.toFixed(2)}h</div>
          <p className="text-xs text-muted-foreground mt-1">
            As of today ({format(new Date(), 'MMM d')})
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Cap Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold">
            {capDate ? format(new Date(capDate + 'T00:00:00'), 'MMM d, yyyy') : 'No cap hit'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Estimated date hitting 240h
          </p>
        </CardContent>
      </Card>
      
      {finalBalance >= 230 && (
        <Card className="md:col-span-2 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4 flex items-center gap-3 text-orange-700 dark:text-orange-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm font-medium">
              You are nearing the 240h cap. Consider planning some PTO!
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
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
                  <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {format(parseISO(entry.startDate), 'MMM d')} 
                        {entry.startDate !== entry.endDate && ` - ${format(parseISO(entry.endDate), 'MMM d')}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.description || 'PTO'} • {entry.totalHours}h
                      </div>
                    </div>
                    <Badge variant={isUpcoming ? "default" : "secondary"}>
                      {isUpcoming ? "Upcoming" : "Recent"}
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
