import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { DEFAULT_SETTINGS } from '@/utils/pto-calc';

export function SettingsForm() {
  const settings = useLiveQuery(() => db.settings.orderBy('id').last());
  const [accrualRate, setAccrualRate] = useState<string>(DEFAULT_SETTINGS.accrualRate.toString());
  const [maxBalance, setMaxBalance] = useState<string>(DEFAULT_SETTINGS.maxBalance.toString());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setAccrualRate(settings.accrualRate.toString());
      setMaxBalance(settings.maxBalance.toString());
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAccrualRate = parseFloat(accrualRate);
    const parsedMaxBalance = parseFloat(maxBalance);

    if (!Number.isFinite(parsedAccrualRate) || parsedAccrualRate <= 0) {
      return;
    }
    if (!Number.isFinite(parsedMaxBalance) || parsedMaxBalance <= 0) {
      return;
    }

    await db.settings.clear();
    await db.settings.add({
      accrualRate: parsedAccrualRate,
      maxBalance: parsedMaxBalance,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          App Settings
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <Label>Appearance</Label>
              <p className="text-xs text-muted-foreground">Light, dark, or match your system</p>
            </div>
            <ThemeToggle />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="accrualRate">Accrual Rate (Hours per period)</Label>
            <Input
              id="accrualRate"
              type="number"
              step="0.01"
              value={accrualRate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccrualRate(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Most semi-monthly (ADP) systems use 8.33. For exact 8h 20m, use 8.3333333333.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxBalance">Maximum PTO Balance (Hours)</Label>
            <Input
              id="maxBalance"
              type="number"
              step="1"
              value={maxBalance}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxBalance(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Usually 240 hours.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {saved ? (
            <p className="text-sm text-muted-foreground">Settings saved.</p>
          ) : (
            <span />
          )}
          <Button type="submit" className="w-full gap-2 sm:w-auto">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
