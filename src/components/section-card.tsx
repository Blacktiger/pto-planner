import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  icon: LucideIcon
  title: string
  children: React.ReactNode
  className?: string
  titleClassName?: string
}

export function SectionCard({
  icon: Icon,
  title,
  children,
  className,
  titleClassName,
}: SectionCardProps) {
  return (
    <Card className={cn('w-full max-w-4xl mx-auto', className)}>
      <CardHeader>
        <CardTitle className={cn('flex items-center gap-2', titleClassName)}>
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
