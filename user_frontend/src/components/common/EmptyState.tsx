import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
      <Icon className="h-7 w-7 text-muted-foreground" />
    </div>
    <h3 className="text-title text-foreground mb-1">{title}</h3>
    <p className="text-small text-muted-foreground mb-4 max-w-[260px]">{description}</p>
    {actionLabel && onAction && (
      <Button size="sm" onClick={onAction}>{actionLabel}</Button>
    )}
  </div>
);

export default EmptyState;
