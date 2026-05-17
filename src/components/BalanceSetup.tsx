import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface BalanceSetupProps {
  onSuccess: () => void;
}

export function BalanceSetup({ onSuccess }: BalanceSetupProps) {
  const [balance, setBalance] = useState<string>('');
  const [asOfDate, setAsOfDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balance || !asOfDate) return;

    await db.resets.clear(); // Only keep one reset for now as per simple rules
    await db.resets.add({
      balance: parseFloat(balance),
      asOfDate,
      createdAt: Date.now(),
    });

    onSuccess();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Initial Balance Setup</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="balance">Current PTO Balance (Hours)</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={balance}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBalance(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="asOfDate">As of Date</Label>
            <Input
              id="asOfDate"
              type="date"
              value={asOfDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAsOfDate(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Save Balance</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
