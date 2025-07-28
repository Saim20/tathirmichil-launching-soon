import { FaSpinner, FaExclamationTriangle, FaBook } from 'react-icons/fa';
import { bloxat } from '@/components/fonts';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { EmptyState as SharedEmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';

export function LoadingState() {
  return (
    <div className="col-span-full flex items-center justify-center py-16">
      <LoadingSpinner 
        variant="student" 
        size="xl" 
        text="Loading tests..." 
      />
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="col-span-full">
      <SharedEmptyState
        title="No tests available"
        description="Check back later for new tests!"
        icon={<FaBook className="text-6xl" />}
        variant="student"
      />
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="col-span-full">
      <SharedEmptyState
        title="Something went wrong"
        description={error}
        icon={<FaExclamationTriangle className="text-6xl" />}
        variant="student"
        action={onRetry ? {
          label: "Try Again",
          onClick: onRetry
        } : undefined}
      />
    </div>
  );
}

export function LoadMoreButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <div className="col-span-full mt-8 text-center">
      <Button
        variant="secondary"
        size="lg"
        onClick={onClick}
        disabled={loading}
        icon={loading ? <FaSpinner className="animate-spin" /> : undefined}
        className="px-8"
      >
        {loading ? "Loading..." : "Load More Tests"}
      </Button>
    </div>
  );
}