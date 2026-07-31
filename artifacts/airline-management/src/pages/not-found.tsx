import { useLocation } from 'wouter';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="text-center max-w-md">
        <div className="bg-primary/10 rounded-full p-6 inline-flex mb-6">
          <FileQuestion className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-3">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => window.history.back()} variant="outline" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={() => setLocation('/')} data-testid="button-home">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
