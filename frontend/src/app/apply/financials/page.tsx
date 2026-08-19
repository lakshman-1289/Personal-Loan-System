'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { AlertCircle, ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';

export default function FinancialStep() {
  const { session } = useAuth();
  const [appId, setAppId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [creditScore, setCreditScore] = useState('750');
  const [existingDebt, setExistingDebt] = useState('0');
  const [employer, setEmployer] = useState('');
  const [designation, setDesignation] = useState('');

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
        const finRes = await axios.get(`/api/v1/financials/${response.data.applicationId}`);
        if (finRes.data) {
          setMonthlyIncome(finRes.data.monthlyIncome?.toString() || '');
          setAnnualIncome(finRes.data.annualIncome?.toString() || '');
          setRequestedAmount(finRes.data.requestedAmount?.toString() || '');
          setCreditScore(finRes.data.creditScore?.toString() || '750');
          setExistingDebt(finRes.data.existingDebt?.toString() || '0');
          setEmployer(finRes.data.employer || '');
          setDesignation(finRes.data.designation || '');
        }
      } catch (e) {
        // Financials might not exist yet
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [session, router]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await axios.post(`/api/v1/financials/${appId}`, {
        monthlyIncome: parseFloat(monthlyIncome),
        annualIncome: parseFloat(annualIncome),
        requestedAmount: parseFloat(requestedAmount),
        creditScore: parseInt(creditScore),
        existingDebt: parseFloat(existingDebt),
        employer,
        designation,
      });
      router.push('/apply/eligibility');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save financial details. Check input formats.');
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
        <span className="text-white font-bold">2. Financials</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span>3. Selected Terms</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span>4. Bank details</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span>5. Sign Declarations</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Financial Declarations</h2>
        <p className="text-slate-400 text-xs mb-8">Declare your monthly salaries and credit indicator markers below.</p>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Net Income (₹)</label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-white"
                placeholder="e.g. 50000"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Annual Gross Income (₹)</label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-white"
                placeholder="e.g. 600000"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Requested Loan Principal (₹)</label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-white"
                placeholder="e.g. 200000"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Self-Declared Credit Score</label>
              <input
                type="number"
                required
                min="300"
                max="850"
                value={creditScore}
                onChange={(e) => setCreditScore(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-white"
                placeholder="300 - 850"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Existing Monthly Debts (EMIs) (₹)</label>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={existingDebt}
                onChange={(e) => setExistingDebt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-white"
                placeholder="Existing monthly EMIs"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Employer Name</label>
              <input
                type="text"
                required
                value={employer}
                onChange={(e) => setEmployer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-white"
                placeholder="Employer Private Ltd"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Job Designation</label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-white"
                placeholder="Software Engineer, Consultant, Manager"
              />
            </div>
          </div>

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
