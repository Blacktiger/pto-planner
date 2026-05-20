import React from 'react';
import { useBalanceSetup } from './useBalanceSetup';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface BalanceSetupProps {
  onSuccess: () => void;
}

export function BalanceSetup({ onSuccess }: BalanceSetupProps) {
  const { balance, setBalance, asOfDate, setAsOfDate, handleSubmit } = useBalanceSetup({
    onSuccess,
  });

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
