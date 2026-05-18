import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  caption?: string
  className?: string
}

export function StatCard({ icon: Icon, label, value, caption, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {value}
        {caption ? (
          <p className="text-xs text-muted-foreground mt-1">{caption}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function StatValue({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('text-3xl font-bold', className)}>{children}</div>
}
