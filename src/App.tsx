import { useState } from 'react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Dashboard } from '@/components/Dashboard';
import { BalanceSetup } from '@/components/BalanceSetup';
import { PTOEntryForm } from '@/components/PTOEntryForm';
import { PTOList } from '@/components/PTOList';
import { ProjectionCalculator } from '@/components/ProjectionCalculator';
import { Timeline } from '@/components/Timeline';
import { Button } from '@/components/ui/button';
import { Settings, Plus, LayoutDashboard, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const reset = useLiveQuery(() => db.resets.toCollection().last());

  if (reset === undefined) return <div className="p-8 text-center">Loading...</div>;

  if (!reset) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8 flex flex-col items-center justify-center">
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
    <div className="min-h-screen bg-background pb-20 sm:pb-8">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl px-4">
            PTO Planner
          </div>
          <Button variant="ghost" size="icon" onClick={() => {
            if (confirm('Reset everything? This will clear all data.')) {
              db.delete().then(() => window.location.reload());
            }
          }}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="container p-4 sm:p-8 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dash</span>
              </TabsTrigger>
              <TabsTrigger value="pto" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Time</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-8 outline-none">
            <Dashboard />
            <ProjectionCalculator />
          </TabsContent>

          <TabsContent value="pto" className="space-y-8 outline-none">
            <PTOEntryForm onSuccess={() => setActiveTab('dashboard')} />
            <PTOList />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-8 outline-none">
            <Timeline />
          </TabsContent>
        </Tabs>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background sm:hidden">
        <div className="grid h-16 grid-cols-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center gap-1 ${activeTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-xs">Dash</span>
          </button>
          <button
            onClick={() => setActiveTab('pto')}
            className={`flex flex-col items-center justify-center gap-1 ${activeTab === 'pto' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs">Add</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex flex-col items-center justify-center gap-1 ${activeTab === 'timeline' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <History className="w-5 h-5" />
            <span className="text-xs">Time</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
