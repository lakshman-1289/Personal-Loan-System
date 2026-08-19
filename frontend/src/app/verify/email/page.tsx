'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { AlertCircle, Mail, Send } from 'lucide-react';

export default function VerifyEmail() {
  const { session } = useAuth();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  // Route protection
  useEffect(() => {
    if (!session) {
      router.replace('/login');
    }
  }, [session, router]);

  const sendOtp = async () => {
    setError(null);
    setInfo(null);
    setSending(true);
    try {
      const response = await axios.post('/api/v1/verification/email/send');
      setInfo(response.data.message || 'Verification email code sent successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to dispatch email verification OTP.');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const response = await axios.post('/api/v1/verification/email/verify', { token });
      setInfo(response.data.message || 'Email verified successfully!');
      // Short delay before redirecting to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please check the OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

      <div className="mb-8 text-center space-y-3">
        <div className="h-12 w-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-400">
          <Mail className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Verify Your Email</h2>
        <p className="text-slate-400 text-xs leading-relaxed">
          Please confirm your email address. We need to verify this communication channel before proceeding to the KYC steps.
        </p>
      </div>

      {info && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs">
          <span>{info}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Verification Token / OTP</label>
          <input
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200 text-center font-mono tracking-widest text-lg text-white"
            placeholder="e.g. 123456"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            disabled={sending}
            onClick={sendOtp}
            className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 font-semibold rounded-xl text-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{sending ? 'Sending...' : 'Send OTP'}</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            <span>Verify OTP</span>
          </button>
        </div>
      </form>
    </div>
  );
}
