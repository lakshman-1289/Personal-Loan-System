'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Percent,
  TrendingUp,
  UserCheck,
  Loader2,
  XCircle,
  Banknote,
  ClipboardList,
  RefreshCw
} from 'lucide-react';

interface LoanApplicationSummary {
  applicationId: number;
  applicantName: string;
  requestedAmount: number;
  tenureMonths: number | null;
  status: string;
  submittedAt: string;
}

const isTerminalState = (status: string) => {
  return status === 'DISBURSED' || 
         status === 'REJECTED' || 
         status === 'SELFIE_REJECTED' || 
         status === 'NOT_ELIGIBLE';
};

export default function Dashboard() {
  const { session, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<LoanApplicationSummary[]>([]);
  const [activeApp, setActiveApp] = useState<LoanApplicationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !session) {
      router.replace('/login');
    }
  }, [session, authLoading, router]);

  // Fetch all loan applications for this user
  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/applications');
      const list: LoanApplicationSummary[] = response.data || [];
      setApplications(list);

      // Find the first active (non-terminal) application
      const active = list.find((app) => !isTerminalState(app.status));
      setActiveApp(active || null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch loan applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchApplications();
    }
  }, [session]);

  const handleApplyNewLoan = async () => {
    if (activeApp) return; // Prevent starting a new loan if one is active
    setLoading(true);
    setError(null);
    try {
      await axios.post('/api/v1/applications');
      await fetchApplications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start a new loan application.');
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 text-brand-blue animate-spin" />
        <span className="text-xs text-neutral-secondary">Loading your dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-[#E4EAF0] p-8 rounded-2xl shadow-lg text-center space-y-4 text-neutral-text">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-neutral-text">Something Went Wrong</h3>
        <p className="text-xs text-neutral-secondary">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-brand-green hover:bg-brand-dark-green text-white text-xs font-semibold rounded-lg cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  // Visual status badge styles for the table
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'SELFIE_UNDER_REVIEW':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'APPROVED':
      case 'SELFIE_APPROVED':
      case 'DISBURSEMENT_PENDING':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'DISBURSED':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'REJECTED':
      case 'SELFIE_REJECTED':
      case 'NOT_ELIGIBLE':
        return 'bg-rose-100 text-rose-800 border border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Helper for timeline steps
  const getStatusStepIndex = (status: string) => {
    const steps = [
      'EMAIL_VERIFICATION',
      'PHONE_VERIFICATION',
      'KYC_PENDING',
      'KYC_COMPLETED',
      'ELIGIBILITY_PENDING',
      'ELIGIBLE',
      'PARTIALLY_ELIGIBLE',
      'TERMS_PENDING',
      'BANK_PENDING',
      'DECLARATION_PENDING',
      'SELFIE_PENDING',
      'SELFIE_UNDER_REVIEW',
      'SELFIE_APPROVED',
      'APPROVED',
      'DISBURSEMENT_PENDING',
      'DISBURSED'
    ];
    return steps.indexOf(status);
  };

  // Return formatted status card and action route for the active app
  const renderStatusCard = () => {
    if (!activeApp || !activeApp.status) {
      return null;
    }

    switch (activeApp.status) {
      case 'EMAIL_VERIFICATION':
        return {
          title: 'Email Verification Required',
          desc: 'Verify your email address using an OTP token to secure your credentials.',
          actionText: 'Verify Email',
          actionUrl: '/verify/email',
          icon: <MailIcon className="h-6 w-6 text-brand-blue" />
        };
      case 'PHONE_VERIFICATION':
        return {
          title: 'Mobile Verification Required',
          desc: 'Verify your phone number using a SMS OTP token to complete authentication.',
          actionText: 'Verify Mobile',
          actionUrl: '/verify/phone',
          icon: <PhoneIcon className="h-6 w-6 text-brand-blue" />
        };
      case 'KYC_PENDING':
        return {
          title: 'KYC Document Submission',
          desc: 'Provide your name, date of birth, ID card type/number, and upload your ID verification file.',
          actionText: 'Start KYC Uploads',
          actionUrl: '/apply/kyc',
          icon: <UserCheck className="h-6 w-6 text-brand-blue" />
        };
      case 'KYC_COMPLETED':
      case 'ELIGIBILITY_PENDING':
        return {
          title: 'Financial Information Declarations',
          desc: 'Declare your monthly salary and employer coordinates to compute credit eligibility scores.',
          actionText: 'Submit Financial Details',
          actionUrl: '/apply/financials',
          icon: <TrendingUp className="h-6 w-6 text-brand-blue" />
        };
      case 'ELIGIBLE':
      case 'PARTIALLY_ELIGIBLE':
      case 'TERMS_PENDING':
        return {
          title: 'Select Repayment Terms',
          desc: 'Choose your desired loan principal limit and pick a repayment tenure (12, 24, or 36 months).',
          actionText: 'Choose Loan Terms',
          actionUrl: '/apply/terms',
          icon: <Percent className="h-6 w-6 text-brand-blue" />
        };
      case 'BANK_PENDING':
        return {
          title: 'Banking Account Coordinates',
          desc: 'Provide your active bank account number and branch IFSC code to receive disbursement transfers.',
          actionText: 'Add Bank Details',
          actionUrl: '/apply/bank',
          icon: <Banknote className="h-6 w-6 text-brand-blue" />
        };
      case 'DECLARATION_PENDING':
        return {
          title: 'Legal Disclosures & Consent Sign-offs',
          desc: 'Acknowledge privacy terms, lending conditions, and credit bureau report consent sign-offs.',
          actionText: 'Sign Declarations',
          actionUrl: '/apply/declarations',
          icon: <FileCheck className="h-6 w-6 text-brand-blue" />
        };
      case 'SELFIE_PENDING':
        return {
          title: 'Biometric Face Validation Upload',
          desc: 'Upload or capture a live webcam selfie to verify your face matches your uploaded KYC photo ID.',
          actionText: 'Submit Selfie Verification',
          actionUrl: '/apply/selfie',
          icon: <UserCheck className="h-6 w-6 text-brand-blue" />
        };
      case 'SELFIE_UNDER_REVIEW':
        return {
          title: 'Application Under Review',
          desc: 'Your uploaded selfie and KYC document verification details are currently undergoing manual review by our audit team. Please check back later.',
          actionText: null,
          actionUrl: null,
          icon: <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
        };
      case 'APPROVED':
      case 'DISBURSEMENT_PENDING':
        return {
          title: 'Loan Approved & Awaiting Disbursement',
          desc: 'Congratulations! Your loan is officially approved. Our payments team is processing the disbursement directly to your bank account.',
          actionText: null,
          actionUrl: null,
          icon: <CheckCircle2 className="h-6 w-6 text-brand-green" />
        };
      default:
        return null;
    }
  };

  const activeStepIndex = activeApp?.status ? getStatusStepIndex(activeApp.status) : 0;
  const activeCard = renderStatusCard();

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 text-neutral-text">
      {/* Intro Panel */}
      <div className="bg-white border border-[#E4EAF0] rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-tr from-brand-blue/5 to-brand-green/5 rounded-full blur-3xl -z-10"></div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-text">Hello, {session?.email}</h1>
          <p className="text-neutral-secondary text-xs max-w-xl leading-relaxed">
            Welcome to your personal loan portal. Inspect your dashboard metrics, track pending actions, and review your overall application history below.
          </p>
        </div>
      </div>

      {/* Active Application Tracking Section */}
      {activeApp && activeCard && (
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-neutral-text uppercase tracking-wider">Active Application Tracking</h3>
          
          <div className="bg-white border border-[#E4EAF0] rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex gap-4">
              <div className="p-3 bg-neutral-section rounded-xl border border-[#E4EAF0] self-start mt-1">
                {activeCard.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-neutral-text">{activeCard.title}</h3>
                <p className="text-xs text-neutral-secondary leading-relaxed max-w-xl">{activeCard.desc}</p>
                <div className="text-[10px] text-neutral-secondary font-semibold pt-1">
                  Application Code: <span className="font-mono text-brand-blue bg-brand-light-blue px-2 py-0.5 rounded">#EZ-{activeApp.applicationId}</span> (Stage: {activeApp.status})
                </div>
              </div>
            </div>

            {activeCard.actionText && activeCard.actionUrl && (
              <button
                onClick={() => router.push(activeCard.actionUrl!)}
                className="w-full md:w-auto px-6 py-2.5 bg-brand-green hover:bg-brand-dark-green text-white font-semibold text-xs rounded-xl shadow-lg shadow-brand-green/10 flex items-center justify-center gap-1.5 shrink-0 transition group cursor-pointer"
              >
                <span>{activeCard.actionText}</span>
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </button>
            )}
          </div>

          {/* Active Journey Timeline */}
          <div className="bg-white border border-[#E4EAF0] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <h4 className="text-xs font-bold text-neutral-text uppercase tracking-wider">Active Application Timeline</h4>
            <div className="relative border-l border-[#E4EAF0] ml-4 space-y-8 pb-4">
              {/* Step 1: Verification */}
              <div className="relative pl-6">
                <div className={`absolute left-0 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 ${activeStepIndex >= 2 ? 'bg-brand-green border-brand-green' : 'bg-white border-[#E4EAF0]'}`}></div>
                <div className="space-y-0.5">
                  <h5 className={`text-xs font-bold ${activeStepIndex >= 2 ? 'text-neutral-text' : 'text-neutral-muted'}`}>Email & Mobile OTP Verifications</h5>
                  <p className="text-[10px] text-neutral-secondary">Confirmed communication coordinates.</p>
                </div>
              </div>

              {/* Step 2: KYC */}
              <div className="relative pl-6">
                <div className={`absolute left-0 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 ${activeStepIndex >= 3 ? 'bg-brand-green border-brand-green' : 'bg-white border-[#E4EAF0]'}`}></div>
                <div className="space-y-0.5">
                  <h5 className={`text-xs font-bold ${activeStepIndex >= 3 ? 'text-neutral-text' : 'text-neutral-muted'}`}>KYC Uploads & Income Declarations</h5>
                  <p className="text-[10px] text-neutral-secondary">Government credentials and monthly income statement.</p>
                </div>
              </div>

              {/* Step 3: Terms selection */}
              <div className="relative pl-6">
                <div className={`absolute left-0 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 ${activeStepIndex >= 8 ? 'bg-brand-green border-brand-green' : 'bg-white border-[#E4EAF0]'}`}></div>
                <div className="space-y-0.5">
                  <h5 className={`text-xs font-bold ${activeStepIndex >= 8 ? 'text-neutral-text' : 'text-neutral-muted'}`}>Loan Terms Selection & Bank details</h5>
                  <p className="text-[10px] text-neutral-secondary">Confirming EMI tenures and coordinates for transfer.</p>
                </div>
              </div>

              {/* Step 4: Selfie & Consents */}
              <div className="relative pl-6">
                <div className={`absolute left-0 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 ${activeStepIndex >= 11 ? 'bg-brand-green border-brand-green' : 'bg-white border-[#E4EAF0]'}`}></div>
                <div className="space-y-0.5">
                  <h5 className={`text-xs font-bold ${activeStepIndex >= 11 ? 'text-neutral-text' : 'text-neutral-muted'}`}>Biometric Selfie & Review Queue</h5>
                  <p className="text-[10px] text-neutral-secondary">Identity face checks and admin file audits.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applications Queue/History section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-brand-blue" />
            <h3 className="text-sm font-bold text-neutral-text uppercase tracking-wider">Your Loan Application History</h3>
          </div>
          <button
            onClick={fetchApplications}
            className="inline-flex items-center gap-1.5 bg-neutral-section hover:bg-neutral-border border border-neutral-border text-neutral-text text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <RefreshCw className="h-3 w-3 text-neutral-secondary" />
            <span>Refresh List</span>
          </button>
        </div>

        <div className="bg-white border border-[#E4EAF0] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E4EAF0]">
              <thead className="bg-neutral-section">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-secondary">Application ID</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-secondary">Amount</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-secondary">Tenure</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-secondary">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-secondary">Submitted At</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-neutral-secondary">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4EAF0] bg-white text-xs">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-muted">
                      You have not submitted any loan applications yet.
                    </td>
                  </tr>
                ) : (
                  applications.map((item) => (
                    <tr key={item.applicationId} className="hover:bg-neutral-section/50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-brand-blue">#EZ-{item.applicationId}</td>
                      <td className="px-6 py-4 text-neutral-text font-semibold">
                        {item.requestedAmount > 0 ? `₹${item.requestedAmount.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-neutral-secondary">
                        {item.tenureMonths ? `${item.tenureMonths} Months` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getBadgeStyle(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-secondary">
                        {new Date(item.submittedAt).toLocaleDateString('en-IN')} {new Date(item.submittedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isTerminalState(item.status) ? (
                          <button
                            onClick={() => {
                              // Dynamically route to resume funnel
                              const cardMeta = getFunnelRoute(item.status);
                              if (cardMeta) {
                                router.push(cardMeta);
                              }
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-brand-green hover:bg-brand-dark-green text-white px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            <span>Resume</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-neutral-secondary uppercase font-semibold">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Apply for a New Loan Section */}
      <div className="bg-white border border-[#E4EAF0] rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="mx-auto w-14 h-14 bg-brand-blue/5 rounded-full border border-neutral-border flex items-center justify-center">
            <TrendingUp className="h-7 w-7 text-brand-blue" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-neutral-text">Apply for a New Personal Loan</h3>
            {activeApp ? (
              <p className="text-xs text-rose-500 font-medium max-w-md mx-auto leading-relaxed bg-rose-50 border border-rose-100 rounded-lg p-3">
                You have an active application in progress (#EZ-{activeApp.applicationId}). Please complete it before initiating a new application.
              </p>
            ) : (
              <p className="text-xs text-neutral-secondary max-w-md mx-auto leading-relaxed">
                Need extra funding? Initiate a new personal loan application instantly. Your credit parameters and KYC eligibility checks will be re-run automatically.
              </p>
            )}
          </div>
          <button
            onClick={handleApplyNewLoan}
            disabled={!!activeApp}
            className={`w-full sm:w-auto px-8 py-3 bg-brand-green hover:bg-brand-dark-green text-white font-semibold text-sm rounded-xl shadow-lg transition duration-200 inline-flex items-center justify-center gap-2 ${
              activeApp ? 'opacity-40 cursor-not-allowed hover:bg-brand-green' : 'cursor-pointer hover:shadow-brand-green/20'
            }`}
          >
            <span>Apply for a Personal Loan</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Map status code to funnel URL
function getFunnelRoute(status: string): string | null {
  switch (status) {
    case 'EMAIL_VERIFICATION':
      return '/verify/email';
    case 'PHONE_VERIFICATION':
      return '/verify/phone';
    case 'KYC_PENDING':
      return '/apply/kyc';
    case 'KYC_COMPLETED':
    case 'ELIGIBILITY_PENDING':
      return '/apply/financials';
    case 'ELIGIBLE':
    case 'PARTIALLY_ELIGIBLE':
    case 'TERMS_PENDING':
      return '/apply/terms';
    case 'BANK_PENDING':
      return '/apply/bank';
    case 'DECLARATION_PENDING':
      return '/apply/declarations';
    case 'SELFIE_PENDING':
      return '/apply/selfie';
    default:
      return null;
  }
}

// Inline SVGs
function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 17.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3M9 18h6M9 6h6" />
    </svg>
  );
}
