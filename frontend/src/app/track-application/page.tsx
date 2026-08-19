'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function TrackApplication() {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace(session.role === 'ADMIN' ? '/admin' : '/dashboard');
    } else {
      router.replace('/login');
    }
  }, [session, router]);

  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4">
      <ShieldCheck className="h-8 w-8 text-indigo-500 animate-pulse" />
      <span className="text-xs text-slate-500">Redirecting to secure application tracker...</span>
    </div>
  );
}
