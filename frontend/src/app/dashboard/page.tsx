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
  Banknote
} from 'lucide-react';

interface ApplicationData {
  hasApplication: boolean;
  applicationId?: number;
  status?: string;
}

export default function Dashboard() {
  const { session, loading: authLoading } = useAuth();
  const [app, setApp] = useState<ApplicationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !session) {
      router.replace('/login');
    }
  }, [session, authLoading, router]);

  // Fetch user's latest loan application
  const fetchApplication = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/applications/latest');
      setApp(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch active application.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchApplication();
    }
  }, [session]);

  const handleApplyNewLoan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/v1/applications');
      setApp({
        hasApplication: true,
        applicationId: response.data.applicationId,
        status: response.data.status
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start a new loan application.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 text-brand-blue animate-spin" />
        <span className="text-xs text-neutral-secondary">Loading active session...</span>
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

  if (!app || !app.hasApplication) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 py-6 text-neutral-text">
        {/* Welcome Banner */}
        <div className="bg-white border border-[#E4EAF0] rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-tr from-brand-blue/5 to-brand-green/5 rounded-full blur-3xl -z-10"></div>
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-text">Hello, {session?.email}</h1>
            <p className="text-neutral-secondary text-xs max-w-xl leading-relaxed font-sans">
              Welcome to your personal loan portal. Transform your financial goals into reality.
            </p>
          </div>
        </div>

        {/* Start Application CTA */}
        <div className="bg-white border border-[#E4EAF0] rounded-2xl p-8 shadow-sm text-center max-w-2xl mx-auto space-y-6">
          <div className="mx-auto w-16 h-16 bg-brand-blue/5 rounded-full border border-neutral-border flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-brand-blue" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-neutral-text font-sans">No Active Loan Applications</h3>
            <p className="text-sm text-neutral-secondary max-w-md mx-auto leading-relaxed">
              You do not have any active or pending loan application. Apply for a new personal loan online with instant bureau eligibility checks and flexible repayment tenures.
            </p>
          </div>
          <button
            onClick={handleApplyNewLoan}
            className="w-full sm:w-auto px-8 py-3.5 bg-brand-green hover:bg-brand-dark-green text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-green/10 inline-flex items-center justify-center gap-2 group transition duration-200 cursor-pointer"
          >
            <span>Apply for a Personal Loan</span>
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    );
  }

  // Visual Helper for timeline steps
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

  const currentStepIndex = app.status ? getStatusStepIndex(app.status) : 0;

  // Return formatted status card and action route
  const renderStatusCard = () => {
    if (!app.status) {
      return {
        title: 'Status Unknown',
        desc: 'Please contact support.',
        actionText: null,
        actionUrl: null,
        actionHandler: null,
        icon: <AlertCircle className="h-6 w-6 text-neutral-secondary" />
      };
    }

    switch (app.status) {
      case 'EMAIL_VERIFICATION':
        return {
          title: 'Email Verification Required',
          desc: 'Verify your email address using an OTP token to secure your credentials.',
          actionText: 'Verify Email',
          actionUrl: '/verify/email',
          actionHandler: null,
          icon: <MailIcon className="h-6 w-6 text-brand-blue" />
        };
      case 'PHONE_VERIFICATION':
        return {
          title: 'Mobile Verification Required',
          desc: 'Verify your phone number using a SMS OTP token to complete authentication.',
          actionText: 'Verify Mobile',
          actionUrl: '/verify/phone',
          actionHandler: null,
          icon: <PhoneIcon className="h-6 w-6 text-brand-blue" />
        };
      case 'KYC_PENDING':
        return {
          title: 'KYC Document Submission',
          desc: 'Provide your name, date of birth, ID card type/number, and upload your ID verification file.',
          actionText: 'Start KYC Uploads',
          actionUrl: '/apply/kyc',
          actionHandler: null,
          icon: <UserCheck className="h-6 w-6 text-brand-blue" />
        };
      case 'KYC_COMPLETED':
      case 'ELIGIBILITY_PENDING':
        return {
          title: 'Financial Information Declarations',
          desc: 'Declare your monthly salary and employer coordinates to compute credit eligibility scores.',
          actionText: 'Submit Financial Details',
          actionUrl: '/apply/financials',
          actionHandler: null,
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
          actionHandler: null,
          icon: <Percent className="h-6 w-6 text-brand-blue" />
        };
      case 'BANK_PENDING':
        return {
          title: 'Banking Account Coordinates',
          desc: 'Provide your active bank account number and branch IFSC code to receive disbursement transfers.',
          actionText: 'Add Bank Details',
          actionUrl: '/apply/bank',
          actionHandler: null,
          icon: <Banknote className="h-6 w-6 text-brand-blue" />
        };
      case 'DECLARATION_PENDING':
        return {
          title: 'Legal Disclosures & Consent Sign-offs',
          desc: 'Acknowledge privacy terms, lending conditions, and credit bureau report consent sign-offs.',
          actionText: 'Sign Declarations',
          actionUrl: '/apply/declarations',
          actionHandler: null,
          icon: <FileCheck className="h-6 w-6 text-brand-blue" />
        };
      case 'SELFIE_PENDING':
        return {
          title: 'Biometric Face Validation Upload',
          desc: 'Upload or capture a live webcam selfie to verify your face matches your uploaded KYC photo ID.',
          actionText: 'Submit Selfie Verification',
          actionUrl: '/apply/selfie',
          actionHandler: null,
          icon: <UserCheck className="h-6 w-6 text-brand-blue" />
        };
      case 'SELFIE_UNDER_REVIEW':
        return {
          title: 'Application Under Review',
          desc: 'Your uploaded selfie and KYC document verification details are currently undergoing manual review by our audit team. Please check back later.',
          actionText: null,
          actionUrl: null,
          actionHandler: null,
          icon: <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
        };
      case 'APPROVED':
      case 'DISBURSEMENT_PENDING':
        return {
          title: 'Loan Approved & Awaiting Disbursement',
          desc: 'Congratulations! Your loan is officially approved. Our payments team is processing the disbursement directly to your bank account.',
          actionText: null,
          actionUrl: null,
          actionHandler: null,
          icon: <CheckCircle2 className="h-6 w-6 text-brand-green" />
        };
      case 'DISBURSED':
        return {
          title: 'Loan Active & Disbursed',
          desc: 'Your loan principal has been successfully transferred to your bank account. Monthly repayments and EMI updates will be rendered here shortly.',
          actionText: 'Apply for another Loan',
          actionUrl: null,
          actionHandler: handleApplyNewLoan,
          icon: <CheckCircle2 className="h-6 w-6 text-brand-green" />
        };
      case 'REJECTED':
      case 'SELFIE_REJECTED':
      case 'NOT_ELIGIBLE':
        return {
          title: 'Application Rejected',
          desc: 'We regret to inform you that your application did not meet our credit underwriting parameters at this time. Please contact support for options.',
          actionText: 'Apply for another Loan',
          actionUrl: null,
          actionHandler: handleApplyNewLoan,
          icon: <XCircle className="h-6 w-6 text-rose-500" />
        };
      default:
        return {
          title: 'Loan Onboarding Process',
          desc: 'Please contact customer support to resolve your application status.',
          actionText: null,
          actionUrl: null,
          actionHandler: null,
          icon: <AlertCircle className="h-6 w-6 text-neutral-secondary" />
        };
    }
  };

  const card = renderStatusCard();

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6 text-neutral-text">
      {/* Intro Panel */}
      <div className="bg-white border border-[#E4EAF0] rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-tr from-brand-blue/5 to-brand-green/5 rounded-full blur-3xl -z-10"></div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-text">Hello, {session?.email}</h1>
          <p className="text-neutral-secondary text-xs max-w-xl leading-relaxed">
            Welcome to your personal loan portal. Below is the active stage of your personal loan application: <span className="font-bold text-brand-blue">#EZ-{app.applicationId}</span>.
          </p>
        </div>
      </div>

      {/* Active Stage Status Card */}
      <div className="bg-white border border-[#E4EAF0] rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex gap-4">
          <div className="p-3 bg-neutral-section rounded-xl border border-[#E4EAF0] self-start mt-1">
            {card.icon}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-neutral-text">{card.title}</h3>
            <p className="text-xs text-neutral-secondary leading-relaxed max-w-xl">{card.desc}</p>
            <div className="text-[10px] text-neutral-secondary font-semibold pt-1">
              Current System Code: <span className="font-mono text-brand-blue bg-brand-light-blue px-2 py-0.5 rounded">{app.status}</span>
            </div>
          </div>
        </div>

        {card.actionText && (card.actionUrl || card.actionHandler) && (
          <button
            onClick={() => {
              if (card.actionUrl) {
                router.push(card.actionUrl);
              } else if (card.actionHandler) {
                card.actionHandler();
              }
            }}
            className="w-full md:w-auto px-6 py-2.5 bg-brand-green hover:bg-brand-dark-green text-white font-semibold text-xs rounded-xl shadow-lg shadow-brand-green/10 flex items-center justify-center gap-1.5 shrink-0 transition group cursor-pointer"
          >
            <span>{card.actionText}</span>
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Journey Timeline */}
      <div className="bg-white border border-[#E4EAF0] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <h4 className="text-sm font-bold text-neutral-text uppercase tracking-wider">Application Stages Timeline</h4>
        <div className="relative border-l border-[#E4EAF0] ml-4 space-y-8 pb-4">
          {/* Step 1: Verification */}
          <div className="relative pl-6">
            <div className={`absolute left-0 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 ${currentStepIndex >= 2 ? 'bg-brand-green border-brand-green' : 'bg-white border-[#E4EAF0]'}`}></div>
            <div className="space-y-0.5">
              <h5 className={`text-xs font-bold ${currentStepIndex >= 2 ? 'text-neutral-text' : 'text-neutral-muted'}`}>Email & Mobile OTP Verifications</h5>
              <p className="text-[10px] text-neutral-secondary">Confirmed communication coordinates.</p>
            </div>
          </div>

          {/* Step 2: KYC */}
          <div className="relative pl-6">
            <div className={`absolute left-0 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 ${currentStepIndex >= 3 ? 'bg-brand-green border-brand-green' : 'bg-white border-[#E4EAF0]'}`}></div>
            <div className="space-y-0.5">
              <h5 className={`text-xs font-bold ${currentStepIndex >= 3 ? 'text-neutral-text' : 'text-neutral-muted'}`}>KYC Uploads & Income Declarations</h5>
              <p className="text-[10px] text-neutral-secondary">Government credentials and monthly income statement.</p>
            </div>
          </div>

          {/* Step 3: Terms selection */}
          <div className="relative pl-6">
            <div className={`absolute left-0 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 ${currentStepIndex >= 8 ? 'bg-brand-green border-brand-green' : 'bg-white border-[#E4EAF0]'}`}></div>
            <div className="space-y-0.5">
              <h5 className={`text-xs font-bold ${currentStepIndex >= 8 ? 'text-neutral-text' : 'text-neutral-muted'}`}>Loan Terms Selection & Bank details</h5>
              <p className="text-[10px] text-neutral-secondary">Confirming EMI tenures and coordinates for transfer.</p>
            </div>
          </div>

          {/* Step 4: Selfie & Consents */}
          <div className="relative pl-6">
            <div className={`absolute left-0 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 ${currentStepIndex >= 11 ? 'bg-brand-green border-brand-green' : 'bg-white border-[#E4EAF0]'}`}></div>
            <div className="space-y-0.5">
              <h5 className={`text-xs font-bold ${currentStepIndex >= 11 ? 'text-neutral-text' : 'text-neutral-muted'}`}>Biometric Selfie & Review Queue</h5>
              <p className="text-[10px] text-neutral-secondary">Identity face checks and admin file audits.</p>
            </div>
          </div>

          {/* Step 5: Disbursed */}
          <div className="relative pl-6">
            <div className={`absolute left-0 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 ${app.status === 'DISBURSED' ? 'bg-brand-green border-brand-green' : 'bg-white border-[#E4EAF0]'}`}></div>
            <div className="space-y-0.5">
              <h5 className={`text-xs font-bold ${app.status === 'DISBURSED' ? 'text-brand-green' : 'text-neutral-muted'}`}>Disbursement & Loan Active</h5>
              <p className="text-[10px] text-neutral-secondary">Deduction of processing fees and account transfer.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline icons
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
