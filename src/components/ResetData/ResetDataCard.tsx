import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { SectionCard } from '@/components/section-card'
import { useResetData } from './useResetData'

export function ResetDataCard() {
  const { isOpen, setIsOpen, handleReset } = useResetData();

  return (
    <SectionCard
      icon={AlertCircle}
      title="Danger Zone"
      titleClassName="text-destructive"
    >
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full">
            Reset All Data
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all data?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes your balance, PTO entries, and settings from this device.
              Export a backup first if you want to keep your data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleReset}>
              Reset everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SectionCard>
  )
}
