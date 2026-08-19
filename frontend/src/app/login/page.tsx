'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { AlertCircle, Lock } from 'lucide-react';

export default function Login() {
  const { session, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      router.replace(session.role === 'ADMIN' ? '/admin' : '/dashboard');
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await axios.post('/api/v1/auth/login', { email, password });
      login(response.data);
      router.push(response.data.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      if (err.response && err.response.data) {
        if (err.response.data.error) {
          setError(err.response.data.error);
        } else if (typeof err.response.data === 'object') {
          setFieldErrors(err.response.data);
        } else {
          setError('Invalid credentials.');
        }
      } else {
        setError('Connection error. Is the server running?');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white border border-[#E4EAF0] p-8 rounded-2xl shadow-lg relative overflow-hidden text-neutral-text">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue to-brand-green"></div>

      <div className="mb-8 text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-neutral-text tracking-tight">Welcome Back</h2>
        <p className="text-neutral-secondary text-xs">Log in to manage your loan application</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-secondary">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-[#E4EAF0] text-neutral-text rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition duration-200"
            placeholder="name@example.com"
          />
          {fieldErrors.email && <p className="text-rose-500 text-[10px]">{fieldErrors.email}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-secondary">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-[#E4EAF0] text-neutral-text rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition duration-200"
            placeholder="••••••••"
          />
          {fieldErrors.password && <p className="text-rose-500 text-[10px]">{fieldErrors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-green hover:bg-brand-dark-green text-white font-semibold rounded-xl transition duration-200 shadow-lg shadow-brand-green/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E4EAF0]"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
          <span className="bg-white px-3 text-neutral-secondary">Or login with</span>
        </div>
      </div>

      <a
        href="http://localhost:8080/oauth2/authorization/google"
        className="w-full py-3 border border-[#E4EAF0] text-neutral-text font-semibold rounded-xl flex items-center justify-center space-x-2 text-xs hover:bg-neutral-section transition duration-200 shadow-sm cursor-pointer"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.742 1.058 14.992 0 12 0 7.354 0 3.307 2.68 1.285 6.6l3.98 3.165z"
          />
          <path
            fill="#34A853"
            d="M16.04 15.345c-1.07.728-2.52 1.155-4.04 1.155a7.077 7.077 0 01-6.734-4.856l-3.98 3.165C3.307 21.32 7.354 24 12 24c3.055 0 5.89-.982 8.05-2.673l-4.01-3.982z"
          />
          <path
            fill="#4285F4"
            d="M23.49 12.273c0-.818-.073-1.609-.21-2.373H12v4.582h6.455c-.278 1.482-1.12 2.736-2.415 3.582l4.01 3.982c2.34-2.155 3.69-5.318 3.69-9.173z"
          />
          <path
            fill="#FBBC05"
            d="M5.266 14.235L1.285 17.4A11.968 11.968 0 010 12c0-1.928.455-3.745 1.285-5.4l3.98 3.165c-.244.708-.374 1.472-.374 2.235s.13 1.527.374 2.235z"
          />
        </svg>
        <span>Continue with Google</span>
      </a>

      <div className="mt-8 text-center text-xs text-neutral-secondary">
        Don't have an account?{' '}
        <Link href="/register" className="font-semibold text-brand-blue hover:text-brand-dark-blue hover:underline transition">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
