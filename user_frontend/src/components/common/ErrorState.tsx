import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState = ({ message = 'Something went wrong', onRetry }: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mb-4">
      <AlertCircle className="h-7 w-7 text-destructive" />
    </div>
    <h3 className="text-title text-foreground mb-1">Error</h3>
    <p className="text-small text-muted-foreground mb-4">{message}</p>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-4 w-4 mr-1" /> Retry
      </Button>
    )}
  </div>
);

export default ErrorState;
