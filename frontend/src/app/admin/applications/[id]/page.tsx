'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  FileText,
  Loader2,
  Percent,
  ShieldCheck,
  User,
  XCircle
} from 'lucide-react';

interface AppDetails {
  application: {
    id: number;
    status: string;
    submittedAt: string;
  };
  email: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  kycDetails: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    idType: string;
    idNumber: string;
    documentUrl: string;
  } | null;
  financialDetails: {
    monthlyIncome: number;
    annualIncome: number;
    requestedAmount: number;
    creditScore: number;
    existingDebt: number;
    employer: string;
    designation: string;
  } | null;
  eligibilityResult: {
    creditScore: number;
    debtToIncomeRatio: number;
    maxEligibleAmount: number;
    result: string;
    reason: string;
  } | null;
  loanTerms: {
    principal: number;
    interestRate: number;
    tenureMonths: number;
    emi: number;
    processingFee: number;
    gst: number;
    netDisbursedAmount: number;
    irr: number;
  } | null;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountType: string;
    bankName: string;
    branchName: string;
  } | null;
  declaration: {
    acceptedPrivacyPolicy: boolean;
    acceptedTermsAndConditions: boolean;
    acceptedCreditBureauConsent: boolean;
    ipAddress: string;
    consentTimestamp: string;
  } | null;
  selfieDetails: {
    selfieUrl: string;
    matchScore: number;
    livenessPassed: boolean;
    status: string;
  } | null;
}

export default function AdminApplicationReview({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const appId = unwrappedParams.id;

  const { session, loading: authLoading } = useAuth();
  const [details, setDetails] = useState<AppDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!session) {
        router.replace('/login');
      } else if (session.role !== 'ADMIN') {
        router.replace('/dashboard');
      }
    }
  }, [session, authLoading, router]);

  // Fetch full details
  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/v1/admin/applications/${appId}`);
      setDetails(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve application details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && session.role === 'ADMIN') {
      fetchDetails();
    }
  }, [session, appId]);

  // Approve / Reject Selfie
  const handleReviewSelfie = async (status: 'APPROVED' | 'REJECTED') => {
    if (status === 'REJECTED' && !reviewReason) {
      setError('Please provide a reason comments for rejecting the selfie.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await axios.post(`/api/v1/admin/applications/${appId}/review-selfie`, {
        status,
        reason: reviewReason,
      });
      setReviewReason('');
      await fetchDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  // Disburse Loan Funds
  const handleDisburse = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await axios.post(`/api/v1/admin/applications/${appId}/disburse`);
      await fetchDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to execute disbursement.');
    } finally {
      setSubmitting(false);
    }
  };

  const getFileUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return url.startsWith('/') ? url : `/${url}`;
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 text-brand-blue animate-spin" />
        <span className="text-xs text-neutral-secondary">Retrieving journey parameters...</span>
      </div>
    );
  }

  if (error && !details) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-[#E4EAF0] p-8 rounded-2xl shadow-lg text-center space-y-4 text-neutral-text">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-neutral-text">Verification Failed</h3>
        <p className="text-xs text-neutral-secondary">{error}</p>
        <button
          onClick={fetchDetails}
          className="px-4 py-2 bg-brand-green hover:bg-brand-dark-green text-white text-xs font-semibold rounded-lg cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!details) return null;

  const app = details.application;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 text-neutral-text">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center gap-1 text-xs text-neutral-secondary hover:text-brand-blue transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Audit Queue</span>
        </button>
        <div className="text-[10px] text-neutral-secondary font-mono">Application: #EZ-{app.id}</div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Applicant Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 columns: applicant data sheets */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Box 1: Profile & KYC */}
          <div className="bg-white border border-[#E4EAF0] rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-text uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-brand-blue" />
              1. Customer Identity & KYC
            </h3>
            {details.kycDetails ? (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-secondary block mb-0.5">Name:</span>
                  <span className="text-neutral-text font-semibold">{details.kycDetails.fullName}</span>
                </div>
                <div>
                  <span className="text-neutral-secondary block mb-0.5">DOB:</span>
                  <span className="text-neutral-text">{details.kycDetails.dateOfBirth}</span>
                </div>
                <div>
                  <span className="text-neutral-secondary block mb-0.5">Gender:</span>
                  <span className="text-neutral-text uppercase">{details.kycDetails.gender}</span>
                </div>
                <div>
                  <span className="text-neutral-secondary block mb-0.5">ID Type & Number:</span>
                  <span className="text-neutral-text">{details.kycDetails.idType}: {details.kycDetails.idNumber}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-neutral-secondary block mb-0.5">Address:</span>
                  <span className="text-neutral-text leading-relaxed">{details.kycDetails.address}</span>
                </div>
                <div className="col-span-2 pt-2">
                  <span className="text-neutral-secondary block mb-2">ID Proof Document:</span>
                  <a
                    href={getFileUrl(details.kycDetails.documentUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-blue hover:underline font-medium"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Open ID File ({details.kycDetails.documentUrl})</span>
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-secondary">KYC details have not been submitted yet.</p>
            )}
          </div>

          {/* Box 2: Financials & Eligibility check */}
          <div className="bg-white border border-[#E4EAF0] rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-text uppercase tracking-wider flex items-center gap-2">
              <Percent className="h-4 w-4 text-brand-blue" />
              2. Financials & Credit scoring
            </h3>
            {details.financialDetails ? (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-secondary block mb-0.5">Employer:</span>
                  <span className="text-neutral-text">{details.financialDetails.employer} ({details.financialDetails.designation})</span>
                </div>
                <div>
                  <span className="text-neutral-secondary block mb-0.5">Monthly Salary:</span>
                  <span className="text-neutral-text font-semibold">₹{details.financialDetails.monthlyIncome.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-neutral-secondary block mb-0.5">Requested Amount:</span>
                  <span className="text-neutral-text">₹{details.financialDetails.requestedAmount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-neutral-secondary block mb-0.5">Existing Debt:</span>
                  <span className="text-neutral-text">₹{details.financialDetails.existingDebt.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-secondary">Financial declarations have not been submitted.</p>
            )}

            {details.eligibilityResult && (
              <div className="bg-neutral-section p-4 rounded-xl border border-[#E4EAF0] text-xs flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-neutral-secondary block mb-0.5">Calculated Limit Result:</span>
                  <span className={`font-bold ${details.eligibilityResult.result === 'NOT_ELIGIBLE' ? 'text-rose-600' : 'text-brand-green'}`}>
                    {details.eligibilityResult.result} - Max: ₹{details.eligibilityResult.maxEligibleAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-secondary block mb-0.5">DTI Ratio:</span>
                  <span className="text-neutral-text font-bold font-mono">{details.eligibilityResult.debtToIncomeRatio}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Box 3: Terms & Bank coordinates */}
          <div className="bg-white border border-[#E4EAF0] rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-text uppercase tracking-wider flex items-center gap-2">
              <Banknote className="h-4 w-4 text-brand-blue" />
              3. Terms Selected & Banking Coordinates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Selected terms terms */}
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-neutral-text block mb-1">Selected Amortization</span>
                {details.loanTerms ? (
                  <div className="space-y-1.5 text-neutral-secondary">
                    <div>Tenure: <span className="text-neutral-text font-bold">{details.loanTerms.tenureMonths} Months</span></div>
                    <div>Principal: <span className="text-neutral-text font-semibold">₹{details.loanTerms.principal.toLocaleString('en-IN')}</span></div>
                    <div>EMI Rate: <span className="text-neutral-text">₹{details.loanTerms.emi.toLocaleString('en-IN')}/mo</span></div>
                    <div>Compounded IRR: <span className="text-brand-blue font-semibold font-mono">{details.loanTerms.irr.toFixed(2)}%</span></div>
                  </div>
                ) : (
                  <span className="text-neutral-secondary">Terms not selected.</span>
                )}
              </div>

              {/* Bank coordinates */}
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-neutral-text block mb-1">Bank Account Details</span>
                {details.bankDetails ? (
                  <div className="space-y-1.5 text-neutral-secondary">
                    <div>Bank: <span className="text-neutral-text font-semibold">{details.bankDetails.bankName}</span></div>
                    <div>Account: <span className="text-neutral-text font-semibold">{details.bankDetails.accountNumber}</span></div>
                    <div>IFSC: <span className="text-neutral-text font-mono">{details.bankDetails.ifscCode}</span></div>
                    <div>Type: <span className="text-neutral-text uppercase">{details.bankDetails.accountType}</span></div>
                  </div>
                ) : (
                  <span className="text-neutral-secondary">Bank credentials not provided.</span>
                )}
              </div>
            </div>
          </div>

          {/* Box 4: Consent audit */}
          <div className="bg-white border border-[#E4EAF0] rounded-2xl p-6 space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-text uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-blue" />
              4. Legal Audits & IP Stamps
            </h3>
            {details.declaration ? (
              <div className="text-xs space-y-1.5 text-neutral-secondary">
                <div>Client Remote IP Address: <span className="text-neutral-text font-mono">{details.declaration.ipAddress}</span></div>
                <div>Consent Audit Timestamp: <span className="text-neutral-text">{new Date(details.declaration.consentTimestamp).toLocaleString('en-IN')}</span></div>
                <div className="flex gap-2 pt-1.5">
                  <span className="px-2 py-0.5 bg-brand-light-green text-brand-green border border-brand-green/20 text-[9px] font-bold uppercase rounded">Privacy OK</span>
                  <span className="px-2 py-0.5 bg-brand-light-green text-brand-green border border-brand-green/20 text-[9px] font-bold uppercase rounded">Bureau Consent OK</span>
                </div>
              </div>
            ) : (
              <span className="text-neutral-secondary text-xs">Declarations not confirmed.</span>
            )}
          </div>

        </div>

        {/* Right 1 column: Selfie checking & Admin decisions actions */}
        <div className="space-y-8">
          
          {/* Selfie Box */}
          <div className="bg-white border border-[#E4EAF0] rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-text uppercase tracking-wider">Customer Selfie Portrait</h3>
            {details.selfieDetails ? (
              <div className="space-y-4">
                <div className="bg-neutral-section rounded-xl overflow-hidden border border-[#E4EAF0] h-[220px]">
                  <img
                    src={getFileUrl(details.selfieDetails.selfieUrl)}
                    alt="Customer verification selfie"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-neutral-section border border-[#E4EAF0] p-3 rounded-lg text-xs space-y-1 font-mono text-brand-blue">
                  <div>Match Score: {details.selfieDetails.matchScore.toFixed(2)}%</div>
                  <div>Liveness Passed: {details.selfieDetails.livenessPassed ? 'YES' : 'NO'}</div>
                  <div>Verified Status: {details.selfieDetails.status}</div>
                </div>
              </div>
            ) : (
              <span className="text-neutral-secondary text-xs block">Selfie image not uploaded.</span>
            )}
          </div>

          {/* Admin Decision card */}
          <div className="bg-white border border-[#E4EAF0] rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-text uppercase tracking-wider">Administrative Decision</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-neutral-secondary block mb-0.5">Application Status:</span>
                <span className="text-sm font-bold text-brand-blue uppercase font-mono">{app.status}</span>
              </div>

              {/* Action 1: Manual Review Form (SELFIE_UNDER_REVIEW) */}
              {app.status === 'SELFIE_UNDER_REVIEW' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-neutral-secondary">Review Comments (Required for rejection)</label>
                    <textarea
                      rows={2}
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      className="w-full bg-white border border-[#E4EAF0] rounded-lg p-2 text-xs text-neutral-text resize-none focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
                      placeholder="Audit feedback..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReviewSelfie('REJECTED')}
                      disabled={submitting}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleReviewSelfie('APPROVED')}
                      disabled={submitting}
                      className="flex-1 py-2 bg-brand-green hover:bg-brand-dark-green text-white font-semibold text-xs rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action 2: Disburse Button (APPROVED) */}
              {app.status === 'APPROVED' && (
                <button
                  onClick={handleDisburse}
                  disabled={submitting}
                  className="w-full py-3 bg-brand-green hover:bg-brand-dark-green text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-brand-green/10 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>Execute Loan Disbursement</span>
                </button>
              )}

              {/* Outcome feedback */}
              {app.status === 'DISBURSED' && (
                <div className="p-3 bg-brand-light-green border border-brand-green/20 text-brand-green text-xs rounded-xl flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-green" />
                  <span>Funds disbursed. Repayment ledger active.</span>
                </div>
              )}

              {(app.status === 'REJECTED' || app.status === 'SELFIE_REJECTED' || app.status === 'NOT_ELIGIBLE') && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs rounded-xl flex items-center gap-2">
                  <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>Application rejected by administrator audit.</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
