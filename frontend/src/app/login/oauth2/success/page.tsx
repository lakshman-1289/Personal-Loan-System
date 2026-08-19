'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, UserSession } from '../../../../context/AuthContext';
import { Loader2 } from 'lucide-react';

function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding JWT token', e);
    return null;
  }
}

function OAuth2SuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, login } = useAuth();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
      return;
    }

    const token = searchParams.get('token');

    if (token) {
      const decoded = decodeJwt(token);
      if (decoded) {
        const sessionData: UserSession = {
          token: token,
          email: decoded.sub || '',
          role: decoded.role as 'CUSTOMER' | 'ADMIN',
          userId: decoded.userId ? Number(decoded.userId) : 0
        };

        // Store token and populate auth context session
        login(sessionData);

        // Delay slightly for smooth transition UI
        const timer = setTimeout(() => {
          router.push('/dashboard');
        }, 800);

        return () => clearTimeout(timer);
      } else {
        router.push('/login?error=token_invalid');
      }
    } else {
      router.push('/login?error=oauth_failed');
    }
  }, [searchParams, session, login, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-12 w-12 text-brand-blue animate-spin" />
      <h2 className="text-xl font-bold text-neutral-text">Completing Sign In</h2>
      <p className="text-sm text-neutral-secondary">Securely authenticating with Google... please wait.</p>
    </div>
  );
}

export default function OAuth2SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-brand-blue animate-spin" />
        <h2 className="text-xl font-bold text-neutral-text font-sans">Loading</h2>
      </div>
    }>
      <OAuth2SuccessHandler />
    </Suspense>
  );
}
