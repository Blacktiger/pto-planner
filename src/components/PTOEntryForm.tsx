import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CalendarPlus } from 'lucide-react';
import { calculateTotalHours } from '@/utils/pto-calc';

interface PTOEntryFormProps {
  onSuccess: () => void;
}

export function PTOEntryForm({ onSuccess }: PTOEntryFormProps) {
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [hoursPerDay, setHoursPerDay] = useState<string>('8');
  const [description, setDescription] = useState<string>('');

  const calculateTotal = () => calculateTotalHours(startDate, endDate, parseFloat(hoursPerDay || '0'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalHours = calculateTotal();
    if (totalHours <= 0) return;

    await db.entries.add({
      startDate,
      endDate,
      hoursPerDay: parseFloat(hoursPerDay),
      totalHours,
      description,
      isFullDay: parseFloat(hoursPerDay) >= 8,
      createdAt: Date.now(),
    });

    onSuccess();
    setDescription('');
  };

  const total = calculateTotal();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarPlus className="w-5 h-5" />
          Add PTO Entry
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hoursPerDay">Hours Per Day</Label>
            <Input
              id="hoursPerDay"
              type="number"
              step="0.5"
              value={hoursPerDay}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHoursPerDay(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Vacation, Appointment, etc."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
            />
          </div>
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Estimated Total: {total} hours
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={total <= 0}>
            Add PTO
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
