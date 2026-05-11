'use client';

import { Loader2, Plus } from 'lucide-react';
import { Button } from './ui/button';

interface SharedEmptyStateProps {
  isLoading: boolean;
  isEmpty: boolean;
  isSeeding?: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  seedLabel?: string;
  onSeed?: () => void | Promise<void>;
  loadingMessage: string;
  color?: string;
}

export function SharedEmptyState({
  isLoading,
  isEmpty,
  isSeeding,
  icon,
  title,
  description,
  seedLabel = 'Create',
  onSeed,
  loadingMessage,
  color = 'text-primary',
}: SharedEmptyStateProps) {
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">{loadingMessage}</p>
      </div>
    );
  }

  if (!isEmpty) return null;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center">
      <div
        className={`w-20 h-20 rounded-full bg-muted/10 flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
      <div className="max-w-md space-y-3">
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {onSeed && (
        <Button
          onClick={onSeed}
          size="lg"
          disabled={isSeeding}
          className="rounded-xl px-12 h-14 text-lg font-bold shadow-lg"
        >
          {isSeeding ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Seeding...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" /> {seedLabel}
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export function SharedLoadingState({
  message,
  color = 'text-muted-foreground',
}: {
  message: string;
  color?: string;
}) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className={`w-10 h-10 ${color} animate-spin`} />
      <p className={`${color} animate-pulse font-medium`}>{message}</p>
    </div>
  );
}
