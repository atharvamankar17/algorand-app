import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Page Not Found" showBack={false}>
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <h2 className="text-xl font-semibold text-muted-foreground">Page Not Found</h2>
        <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          <Home className="mr-2 h-4 w-4" />
          Go Home
        </Button>
      </div>
    </AppLayout>
  );
}
