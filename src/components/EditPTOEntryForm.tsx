import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { calculateTotalHours } from '@/utils/pto-calc';
import type { PTOEntry } from '@/types/pto';

export interface EditPTOEntryFormProps {
  entry: PTOEntry;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditPTOEntryForm({ entry, onSuccess, onCancel }: EditPTOEntryFormProps) {
  const [startDate, setStartDate] = useState<string>(entry.startDate);
  const [endDate, setEndDate] = useState<string>(entry.endDate);
  const [hoursPerDay, setHoursPerDay] = useState<string>(String(entry.hoursPerDay));
  const [description, setDescription] = useState<string>(entry.description ?? '');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Derived values
  const hoursNum = parseFloat(hoursPerDay || '0');
  const totalHours = calculateTotalHours(startDate, endDate, hoursNum);

  // Validation rules
  const isDateOrderValid = endDate >= startDate;
  const isTotalHoursValid = totalHours > 0;
  const isHoursPerDayValid =
    !isNaN(hoursNum) &&
    hoursNum >= 0.5 &&
    hoursNum <= 8 &&
    Math.round(hoursNum * 10) % 5 === 0;
  const isDescriptionValid = description.length <= 255;

  const isValid =
    isDateOrderValid &&
    isTotalHoursValid &&
    isHoursPerDayValid &&
    isDescriptionValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSaveError(null);

    const hours = parseFloat(hoursPerDay);
    const total = calculateTotalHours(startDate, endDate, hours);

    try {
      await db.entries.update(entry.id!, {
        startDate,
        endDate,
        hoursPerDay: hours,
        totalHours: total,
        description,
        isFullDay: hours >= 8,
      });
      onSuccess();
    } catch {
      setSaveError('Save failed. Please try again.');
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Pencil className="w-4 h-4" />
          Edit PTO Entry
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Start Date</Label>
              <Input
                id="edit-startDate"
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endDate">End Date</Label>
              <Input
                id="edit-endDate"
                type="date"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {!isDateOrderValid && (
            <p className="text-sm text-destructive">
              End date must be on or after start date.
            </p>
          )}

          {isDateOrderValid && !isTotalHoursValid && (
            <p className="text-sm text-destructive">
              The selected date range contains no working days.
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-hoursPerDay">Hours Per Day</Label>
            <Input
              id="edit-hoursPerDay"
              type="number"
              step="0.5"
              min="0.5"
              max="8"
              value={hoursPerDay}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHoursPerDay(e.target.value)}
              required
            />
            {!isHoursPerDayValid && (
              <p className="text-sm text-destructive">
                Hours per day must be a multiple of 0.5 between 0.5 and 8.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (Optional)</Label>
            <Input
              id="edit-description"
              placeholder="Vacation, Appointment, etc."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
            />
            {!isDescriptionValid && (
              <p className="text-sm text-destructive">
                Description must be 255 characters or fewer.
              </p>
            )}
          </div>

          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Estimated Total: {totalHours} hours
          </div>

          {saveError && (
            <p className="text-sm text-destructive">{saveError}</p>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={!isValid} className="flex-1">
            Save
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
