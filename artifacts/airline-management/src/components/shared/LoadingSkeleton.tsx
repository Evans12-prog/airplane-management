import { Loader2 } from 'lucide-react';

export function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 bg-muted/50 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card border border-card-border rounded-lg p-6 space-y-3">
      <div className="h-4 bg-muted/50 rounded w-24 animate-pulse" />
      <div className="h-8 bg-muted/50 rounded w-16 animate-pulse" />
      <div className="h-3 bg-muted/50 rounded w-20 animate-pulse" />
    </div>
  );
}
