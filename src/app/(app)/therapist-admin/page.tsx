'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TherapistAdminRoot() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/therapist-admin/dashboard');
  }, [router]);
  return null;
}
