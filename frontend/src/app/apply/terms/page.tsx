'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { AlertCircle, ArrowRight, ChevronLeft, Loader2, Calendar } from 'lucide-react';

interface LoanTermOption {
  tenureMonths: number;
  principal: number;
  interestRate: number;
  emi: number;
  processingFee: number;
  gst: number;
  netDisbursedAmount: number;
  irr: number;
}

export default function TermsStep() {
  const { session } = useAuth();
  const [appId, setAppId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<LoanTermOption[]>([]);
  const [selectedTenure, setSelectedTenure] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.replace('/login');
      return;
    }
    const fetchAppAndOptions = async () => {
      try {
        const response = await axios.post('/api/v1/applications');
        const id = response.data.applicationId;
        setAppId(id);

        const optionsRes = await axios.get(`/api/v1/applications/${id}/terms-options`);
        setOptions(optionsRes.data);

        // Pre-select if a choice was already locked
        try {
          const termsRes = await axios.get(`/api/v1/applications/${id}/terms`);
          if (termsRes.data) {
            setSelectedTenure(termsRes.data.tenureMonths);
          }
        } catch (e) {
          // Choice not locked yet
        }
      } catch (err: any) {
        setError('Failed to fetch terms configurations.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppAndOptions();
  }, [session, router]);

  // Submit Selected Terms
  const handleSelect = async () => {
    if (!selectedTenure) {
      setError('Please select a tenure option to proceed.');
      return;
    }
    const selectedOption = options.find(o => o.tenureMonths === selectedTenure);
    if (!selectedOption) return;

    setError(null);
    setSubmitting(true);

    try {
      await axios.post(`/api/v1/applications/${appId}/select-terms`, {
        tenureMonths: selectedOption.tenureMonths,
        requestedAmount: selectedOption.principal,
      });
      router.push('/apply/bank');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit loan terms selection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 text-brand-blue animate-spin" />
        <span className="text-xs text-neutral-secondary">Calculating loan amortization models...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-6 text-neutral-text">
      {/* Visual Stepper */}
      <div className="flex items-center justify-between text-xs text-neutral-secondary bg-brand-light-blue border border-[#E4EAF0] rounded-full px-6 py-3">
        <span className="text-brand-blue">1. KYC Details</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-brand-blue">2. Financials</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-brand-blue font-bold">3. Loan Terms Selection</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span>4. Bank details</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span>5. Sign Declarations</span>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-text tracking-tight">Select Loan Terms</h2>
          <p className="text-neutral-secondary text-xs mt-1">Review the reducing balance EMI schedules below and select a tenure option.</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Options Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {options.map((option) => {
            const isSelected = selectedTenure === option.tenureMonths;
            return (
              <div
                key={option.tenureMonths}
                onClick={() => setSelectedTenure(option.tenureMonths)}
                className={`bg-white border rounded-2xl p-6 space-y-5 cursor-pointer transition relative overflow-hidden flex flex-col justify-between ${isSelected ? 'border-brand-green bg-brand-light-green/20 shadow-md' : 'border-[#E4EAF0] hover:border-brand-blue'}`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-neutral-text flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-brand-blue" />
                      {option.tenureMonths} Months
                    </span>
                    {isSelected && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-green/15 text-brand-green rounded">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-secondary font-semibold uppercase tracking-wider">Estimated EMI</div>
                  <div className="text-2xl font-extrabold text-neutral-text">
                    ₹{option.emi.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-neutral-secondary">/mo</span>
                  </div>
                </div>

                <hr className="border-[#E4EAF0]" />

                <div className="space-y-2 text-xs text-neutral-secondary">
                  <div className="flex justify-between">
                    <span>Principal:</span>
                    <span className="text-neutral-text font-medium">₹{option.principal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee (2%):</span>
                    <span className="text-neutral-text font-medium">₹{option.processingFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%):</span>
                    <span className="text-neutral-text font-medium">₹{option.gst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Disbursed:</span>
                    <span className="text-neutral-text font-medium">₹{option.netDisbursedAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compounded IRR:</span>
                    <span className="text-brand-blue font-semibold font-mono">{option.irr.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="pt-6">
          <button
            onClick={handleSelect}
            disabled={submitting || !selectedTenure}
            className="w-full py-3.5 bg-brand-green hover:bg-brand-dark-green text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-brand-green/10 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            <span>Confirm Selection</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
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
