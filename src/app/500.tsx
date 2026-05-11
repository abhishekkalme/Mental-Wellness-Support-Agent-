import { Suspense } from 'react';
import Link from 'next/link';
import { Home, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Error – MindCare AI',
};

function ErrorContent() {
  return (
    <div className="min-h-screen bg-[#0A0C0B] flex flex-col items-center justify-center p-6">
      <AlertTriangle className="w-16 h-16 text-rose-500 mb-4" />
      <h1 className="text-4xl font-bold text-white mb-2">500 – Something went wrong</h1>
      <p className="text-white/50 max-w-md text-center mb-8">
        Our team has been notified. Please try again later.
      </p>
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="border-white/10 text-white hover:bg-white/10"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
        <Link href="/">
          <Button className="bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold rounded-xl gap-2">
            <Home className="w-4 h-4" /> Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function ServerErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0C0B] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#E2FF6F] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
