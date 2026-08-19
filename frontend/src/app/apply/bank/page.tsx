'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { AlertCircle, ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';

export default function BankStep() {
  const { session } = useAuth();
  const [appId, setAppId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountType, setAccountType] = useState('SAVINGS');
  const [branchName, setBranchName] = useState('');

  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.replace('/login');
      return;
    }
    const fetchApp = async () => {
      try {
        const response = await axios.post('/api/v1/applications');
        setAppId(response.data.applicationId);

        // Populate if details already exist
        const bankRes = await axios.get(`/api/v1/banking/${response.data.applicationId}`);
        if (bankRes.data) {
          setAccountNumber(bankRes.data.accountNumber || '');
          setIfscCode(bankRes.data.ifscCode || '');
          setAccountType(bankRes.data.accountType || 'SAVINGS');
          setBranchName(bankRes.data.branchName || '');
        }
      } catch (e) {
        // Bank details might not exist yet
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [session, router]);

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await axios.post(`/api/v1/banking/${appId}`, {
        accountNumber,
        ifscCode: ifscCode.toUpperCase().trim(),
        accountType,
        branchName,
      });
      router.push('/apply/declarations');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save bank coordinates. Verify account format & standard IFSC format.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-500">Retrieving application status...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 py-6">
      {/* Visual Stepper */}
      <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-full px-6 py-3">
        <span className="text-slate-400">1. KYC Details</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-slate-400">2. Financials</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-slate-400">3. Selected Terms</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-white font-bold">4. Bank details</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span>5. Sign Declarations</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Disbursement Bank Account</h2>
        <p className="text-slate-400 text-xs mb-8">Enter your banking coordinates where approved loan funds will be transferred.</p>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Bank Account Number</label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-white"
                placeholder="Numeric 9 to 18 digits"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">IFSC Code</label>
              <input
                type="text"
                required
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-white font-mono uppercase"
                placeholder="e.g. HDFC0001234"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Account Type</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-white"
              >
                <option value="SAVINGS">Savings Account</option>
                <option value="CURRENT">Current Account</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Branch Name</label>
              <input
                type="text"
                required
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-white"
                placeholder="Bank branch location"
              />
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              <span>Save & Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
