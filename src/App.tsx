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
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Settings, Plus, LayoutDashboard, History, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const reset = useLiveQuery(() => db.resets.orderBy('id').last());

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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4 mx-auto">
            <div className="font-bold text-xl flex-shrink-0">
              PTO Planner
            </div>
            
            <div className="hidden sm:block">
              <TabsList className="bg-transparent">
                <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-muted">
                  <LayoutDashboard className="w-4 h-4" />
                  Dash
                </TabsTrigger>
                <TabsTrigger value="pto" className="flex items-center gap-2 data-[state=active]:bg-muted">
                  <Plus className="w-4 h-4" />
                  Add
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center gap-2 data-[state=active]:bg-muted">
                  <History className="w-4 h-4" />
                  Time
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-muted">
                  <Settings className="w-4 h-4" />
                  Set
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="w-10 sm:hidden" /> {/* Spacer for centering mobile title if needed */}
          </div>
        </header>

        <main className="container mx-auto p-4 sm:p-8 space-y-8">
          <TabsContent value="dashboard" className="space-y-8 outline-none mt-0">
            <Dashboard />
            <ProjectionCalculator />
          </TabsContent>

          <TabsContent value="pto" className="space-y-8 outline-none mt-0">
            <PTOEntryForm onSuccess={() => setActiveTab('dashboard')} />
            <PTOList />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-8 outline-none mt-0">
            <Timeline />
          </TabsContent>

          <TabsContent value="settings" className="space-y-8 outline-none mt-0">
            <ImportExport />
            <Card className="w-full max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full" onClick={() => {
                  if (confirm('Are you absolutely sure? This will permanently delete all your PTO data.')) {
                    db.delete().then(() => window.location.reload());
                  }
                }}>
                  Reset All Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </main>
      </Tabs>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background sm:hidden">
        <div className="grid h-16 grid-cols-4">
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
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center gap-1 ${activeTab === 'settings' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">Set</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
