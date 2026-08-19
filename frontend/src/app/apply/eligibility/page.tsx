'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { AlertCircle, ArrowRight, CheckCircle2, ChevronLeft, Loader2, XCircle } from 'lucide-react';

interface EligibilityResult {
  creditScore: number;
  debtToIncomeRatio: number;
  maxEligibleAmount: number;
  result: 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE';
  reason: string;
}

export default function EligibilityStep() {
  const { session } = useAuth();
  const [appId, setAppId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

        // Fetch eligibility if already checked
        const res = await axios.get(`/api/v1/eligibility/${response.data.applicationId}`);
        if (res.data) {
          setResult(res.data);
        }
      } catch (e) {
        // Eligibility check might not have been performed yet
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [session, router]);

  // Execute Credit Check
  const triggerCheck = async () => {
    setError(null);
    setChecking(true);
    try {
      const response = await axios.post(`/api/v1/eligibility/${appId}/check`);
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to complete credit bureau eligibility evaluation.');
    } finally {
      setChecking(false);
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
        <span className="text-white font-bold">3. Eligibility</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span>4. Selected Terms</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span>5. Bank details</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Eligibility Evaluation</h2>
          <p className="text-slate-400 text-xs mt-1">Verify credit rating thresholds and calculate maximum lending limit.</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!result ? (
          <div className="text-center py-10 space-y-4">
            <p className="text-slate-400 text-xs">
              Click the button below to run our eligibility rules. We will inspect your DTI ratio and self-declared credit score.
            </p>
            <button
              onClick={triggerCheck}
              disabled={checking}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 mx-auto disabled:opacity-50 cursor-pointer"
            >
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              <span>Evaluate Eligibility</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Outcomes cards */}
            {result.result === 'ELIGIBLE' || result.result === 'PARTIALLY_ELIGIBLE' ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <h3 className="text-xl font-bold text-white">Congratulations!</h3>
                <p className="text-xs text-slate-400">
                  Based on our underwriting criteria, you are eligible for a personal loan limit up to:
                </p>
                <div className="text-3xl font-extrabold text-emerald-400">
                  ₹{result.maxEligibleAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 pt-1">
                  Status Code: <span className="font-mono text-indigo-400">{result.result}</span>
                </div>
              </div>
            ) : (
              <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl text-center space-y-3">
                <XCircle className="h-10 w-10 text-rose-500 mx-auto" />
                <h3 className="text-xl font-bold text-white">Application Unsuccessful</h3>
                <p className="text-xs text-slate-400">We regret that we cannot proceed with your loan request.</p>
                <div className="p-3 bg-slate-950/60 rounded-xl text-xs text-rose-300 font-mono text-center max-w-md mx-auto">
                  Reason: {result.reason}
                </div>
              </div>
            )}

            {/* Parameter audit details */}
            <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl space-y-2 font-mono text-xs text-indigo-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Credit Score Checked:</span>
                <span>{result.creditScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Debt-to-Income (DTI) Ratio:</span>
                <span>{result.debtToIncomeRatio}%</span>
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="pt-4">
              {(result.result === 'ELIGIBLE' || result.result === 'PARTIALLY_ELIGIBLE') && (
                <button
                  onClick={() => router.push('/apply/terms')}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Select Loan Terms</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
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
