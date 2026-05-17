import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function PTOList() {
  const entries = useLiveQuery(() => db.entries.orderBy('startDate').toArray());

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this PTO entry?')) {
      await db.entries.delete(id);
    }
  };

  if (!entries || entries.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="py-8 text-center text-muted-foreground">
          No PTO entries added yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 px-1">
        <Calendar className="w-5 h-5" />
        Manage PTO
      </h3>
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <div className="font-medium">
                {format(parseISO(entry.startDate), 'MMM d, yyyy')}
                {entry.startDate !== entry.endDate && ` - ${format(parseISO(entry.endDate), 'MMM d, yyyy')}`}
              </div>
              <div className="text-sm text-muted-foreground">
                {entry.description || 'PTO'} • {entry.totalHours} hours
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => handleDelete(entry.id!)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
