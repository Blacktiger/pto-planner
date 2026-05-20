import React from 'react';
import { usePtoEntryForm } from './usePtoEntryForm';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';

interface PTOEntryFormProps {
  onSuccess: () => void;
}

export function PTOEntryForm({ onSuccess }: PTOEntryFormProps) {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    hoursPerDay,
    setHoursPerDay,
    description,
    setDescription,
    total,
    handleSubmit,
  } = usePtoEntryForm({ onSuccess });

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
          <Button type="submit" className="w-full">Add Entry</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
