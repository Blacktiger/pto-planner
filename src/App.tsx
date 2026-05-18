import { useState } from 'react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Dashboard } from '@/components/Dashboard';
import { BalanceSetup } from '@/components/BalanceSetup';
import { PTOEntryForm } from '@/components/PTOEntryForm';
import { PTOList } from '@/components/PTOList';
import { ProjectionCalculator } from '@/components/ProjectionCalculator';
import { Timeline } from '@/components/Timeline';
import { ImportExport } from '@/components/ImportExport';
import { SettingsForm } from '@/components/SettingsForm';
import { ResetAllDataCard } from '@/components/reset-all-data-card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Settings, Plus, LayoutDashboard, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const tabs = [
  { value: 'dashboard', label: 'Dash', icon: LayoutDashboard },
  { value: 'pto', label: 'Time Off', icon: Plus },
  { value: 'timeline', label: 'Timeline', icon: History },
  { value: 'settings', label: 'Settings', icon: Settings },
] as const;

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const reset = useLiveQuery(() => db.resets.orderBy('id').last());

  if (reset === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!reset) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">PTO Planner</h1>
            <p className="mt-2 text-muted-foreground">Set up your balance to get started.</p>
          </div>
          <BalanceSetup onSuccess={() => setActiveTab('dashboard')} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex w-full flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between gap-4 px-4 sm:px-8">
            <div className="text-xl font-bold">PTO Planner</div>

            <div className="hidden items-center gap-2 sm:flex">
              <TabsList className="h-auto bg-transparent p-0">
                {tabs.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-muted"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-screen-xl flex-1 p-4 pb-24 sm:p-8 sm:pb-8">
          <TabsContent value="dashboard" className="mt-0 space-y-8 outline-none">
            <Dashboard />
            <ProjectionCalculator />
          </TabsContent>

          <TabsContent value="pto" className="mt-0 space-y-8 outline-none">
            <PTOEntryForm onSuccess={() => setActiveTab('dashboard')} />
            <PTOList />
          </TabsContent>

          <TabsContent value="timeline" className="mt-0 space-y-8 outline-none">
            <Timeline />
          </TabsContent>

          <TabsContent value="settings" className="mt-0 space-y-8 outline-none">
            <SettingsForm />
            <Separator />
            <ImportExport />
            <Separator />
            <ResetAllDataCard />
          </TabsContent>
        </main>
      </Tabs>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background sm:hidden">
        <div className="grid h-16 grid-cols-4">
          {tabs.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveTab(value)}
              className={cn(
                'flex flex-col items-center justify-center gap-1',
                activeTab === value ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;
