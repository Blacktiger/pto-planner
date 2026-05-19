import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Calendar, Pencil } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { EditPTOEntryForm } from '@/components/EditPTOEntryForm';

export function PTOList() {
  const entries = useLiveQuery(() => db.entries.orderBy('startDate').toArray());
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteId == null) return;
    await db.entries.delete(deleteId);
    setDeleteId(null);
  };

  if (!entries || entries.length === 0) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardContent className="py-8 text-center text-muted-foreground">
          No PTO entries added yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-md space-y-4">
        <h3 className="flex items-center gap-2 px-1 text-lg font-semibold">
          <Calendar className="h-5 w-5" />
          Manage PTO
        </h3>
        {entries.map((entry) => (
          <React.Fragment key={entry.id}>
            <Card className={entry.id === editingId ? 'ring-2 ring-primary' : ''}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">
                    {format(parseISO(entry.startDate), 'MMM d, yyyy')}
                    {entry.startDate !== entry.endDate &&
                      ` - ${format(parseISO(entry.endDate), 'MMM d, yyyy')}`}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {entry.description || 'PTO'} • {entry.totalHours} hours
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingId(entry.id!)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteId(entry.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            {entry.id === editingId && (
              <EditPTOEntryForm
                entry={entry}
                onSuccess={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this PTO entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
