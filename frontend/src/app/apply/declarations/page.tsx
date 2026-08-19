'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { AlertCircle, ArrowRight, ChevronLeft, Loader2, ShieldAlert } from 'lucide-react';

export default function DeclarationsStep() {
  const { session } = useAuth();
  const [appId, setAppId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [acceptedTermsAndConditions, setAcceptedTermsAndConditions] = useState(false);
  const [acceptedCreditBureauConsent, setAcceptedCreditBureauConsent] = useState(false);

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
        const decRes = await axios.get(`/api/v1/declarations/${response.data.applicationId}`);
        if (decRes.data) {
          setAcceptedPrivacyPolicy(decRes.data.acceptedPrivacyPolicy || false);
          setAcceptedTermsAndConditions(decRes.data.acceptedTermsAndConditions || false);
          setAcceptedCreditBureauConsent(decRes.data.acceptedCreditBureauConsent || false);
        }
      } catch (e) {
        // Declarations might not exist yet
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [session, router]);

  // Submit Consent Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedPrivacyPolicy || !acceptedTermsAndConditions || !acceptedCreditBureauConsent) {
      setError('You must accept all terms, policies, and consents to proceed.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      await axios.post(`/api/v1/declarations/${appId}`, {
        acceptedPrivacyPolicy,
        acceptedTermsAndConditions,
        acceptedCreditBureauConsent,
      });
      router.push('/apply/selfie');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit declarations.');
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
        <span className="text-slate-400">4. Bank details</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-white font-bold">5. Sign Declarations</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert className="h-8 w-8 text-indigo-400" />
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Legal Declarations</h2>
            <p className="text-slate-400 text-xs">Review carefully and accept consents to complete onboarding.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            
            {/* Box 1: Privacy policy */}
            <label className="flex items-start gap-4 p-4 bg-slate-950/40 border border-slate-850 rounded-xl hover:border-slate-700 transition cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acceptedPrivacyPolicy}
                onChange={(e) => setAcceptedPrivacyPolicy(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-500"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 block">Accept Privacy Policy</span>
                <span className="text-[10px] text-slate-500 leading-relaxed block">
                  I hereby authorize EZFINANZ to capture, encrypt, and store my personal KYC credentials, email and phone coordinates, and declared financials in accordance with data protection rules.
                </span>
              </div>
            </label>

            {/* Box 2: Terms and conditions */}
            <label className="flex items-start gap-4 p-4 bg-slate-950/40 border border-slate-850 rounded-xl hover:border-slate-700 transition cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acceptedTermsAndConditions}
                onChange={(e) => setAcceptedTermsAndConditions(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-500"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 block">Accept Terms & Lending Conditions</span>
                <span className="text-[10px] text-slate-500 leading-relaxed block">
                  I agree to the terms of the loan contract, calculated reducing-balance EMI installments, standard flat processing fees, and compounding monthly IRR rates as selected.
                </span>
              </div>
            </label>

            {/* Box 3: Credit bureau consent */}
            <label className="flex items-start gap-4 p-4 bg-slate-955/40 border border-slate-855 rounded-xl hover:border-slate-700 transition cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acceptedCreditBureauConsent}
                onChange={(e) => setAcceptedCreditBureauConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-500"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 block">Authorize Credit Bureau Inquiries (CRIB)</span>
                <span className="text-[10px] text-slate-500 leading-relaxed block">
                  I give consent to EZFINANZ to query credit registries, pull my credit scores, and audit outstanding debts to evaluate my borrowing parameters.
                </span>
              </div>
            </label>

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
              <span>Accept & Continue</span>
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
