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
  applicationId: number;
  status: string;
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

  // Fetch or create the user's active loan application
  useEffect(() => {
    if (!session) return;

    const fetchApplication = async () => {
      try {
        const response = await axios.post('/api/v1/applications');
        setApp(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch active application.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [session]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-500">Loading active session...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Something Went Wrong</h3>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!app) return null;

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

  const currentStepIndex = getStatusStepIndex(app.status);

  // Return formatted status card and action route
  const renderStatusCard = () => {
    switch (app.status) {
      case 'EMAIL_VERIFICATION':
        return {
          title: 'Email Verification Required',
          desc: 'Verify your email address using an OTP token to secure your credentials.',
          actionText: 'Verify Email',
          actionUrl: '/verify/email',
          icon: <MailIcon className="h-6 w-6 text-indigo-400" />
        };
      case 'PHONE_VERIFICATION':
        return {
          title: 'Mobile Verification Required',
          desc: 'Verify your phone number using a SMS OTP token to complete authentication.',
          actionText: 'Verify Mobile',
          actionUrl: '/verify/phone',
          icon: <PhoneIcon className="h-6 w-6 text-indigo-400" />
        };
      case 'KYC_PENDING':
        return {
          title: 'KYC Document Submission',
          desc: 'Provide your name, date of birth, ID card type/number, and upload your ID verification file.',
          actionText: 'Start KYC Uploads',
          actionUrl: '/apply/kyc',
          icon: <UserCheck className="h-6 w-6 text-indigo-400" />
        };
      case 'KYC_COMPLETED':
      case 'ELIGIBILITY_PENDING':
        return {
          title: 'Financial Information Declarations',
          desc: 'Declare your monthly salary and employer coordinates to compute credit eligibility scores.',
          actionText: 'Submit Financial Details',
          actionUrl: '/apply/financials',
          icon: <TrendingUp className="h-6 w-6 text-indigo-400" />
        };
      case 'ELIGIBLE':
      case 'PARTIALLY_ELIGIBLE':
      case 'TERMS_PENDING':
        return {
          title: 'Select Repayment Terms',
          desc: 'Choose your desired loan principal limit and pick a repayment tenure (12, 24, or 36 months).',
          actionText: 'Choose Loan Terms',
          actionUrl: '/apply/terms',
          icon: <Percent className="h-6 w-6 text-indigo-400" />
        };
      case 'BANK_PENDING':
        return {
          title: 'Banking Account Coordinates',
          desc: 'Provide your active bank account number and branch IFSC code to receive disbursement transfers.',
          actionText: 'Add Bank Details',
          actionUrl: '/apply/bank',
          icon: <Banknote className="h-6 w-6 text-indigo-400" />
        };
      case 'DECLARATION_PENDING':
        return {
          title: 'Legal Disclosures & Consent Sign-offs',
          desc: 'Acknowledge privacy terms, lending conditions, and credit bureau report consent sign-offs.',
          actionText: 'Sign Declarations',
          actionUrl: '/apply/declarations',
          icon: <FileCheck className="h-6 w-6 text-indigo-400" />
        };
      case 'SELFIE_PENDING':
        return {
          title: 'Biometric Face Validation Upload',
          desc: 'Upload or capture a live webcam selfie to verify your face matches your uploaded KYC photo ID.',
          actionText: 'Submit Selfie Verification',
          actionUrl: '/apply/selfie',
          icon: <UserCheck className="h-6 w-6 text-indigo-400" />
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
          icon: <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        };
      case 'DISBURSED':
        return {
          title: 'Loan Active & Disbursed',
          desc: 'Your loan principal has been successfully transferred to your bank account. Monthly repayments and EMI updates will be rendered here shortly.',
          actionText: null,
          actionUrl: null,
          icon: <CheckCircle2 className="h-6 w-6 text-indigo-500" />
        };
      case 'REJECTED':
      case 'SELFIE_REJECTED':
      case 'NOT_ELIGIBLE':
        return {
          title: 'Application Rejected',
          desc: 'We regret to inform you that your application did not meet our credit underwriting parameters at this time. Please contact support for options.',
          actionText: null,
          actionUrl: null,
          icon: <XCircle className="h-6 w-6 text-rose-500" />
        };
      default:
        return {
          title: 'Loan Onboarding Process',
          desc: 'Please contact customer support to resolve your application status.',
          actionText: null,
          actionUrl: null,
          icon: <AlertCircle className="h-6 w-6 text-slate-500" />
        };
    }
  };

  const card = renderStatusCard();

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6">
      {/* Intro Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Hello, {session?.email}</h1>
          <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
            Welcome to your personal loan portal. Below is the active stage of your personal loan application: **#EZ-{app.applicationId}**.
          </p>
        </div>
      </div>

      {/* Active Stage Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex gap-4">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 self-start mt-1">
            {card.icon}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">{card.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{card.desc}</p>
            <div className="text-[10px] text-slate-500 font-semibold pt-1">
              Current System Code: <span className="font-mono text-indigo-400">{app.status}</span>
            </div>
          </div>
        </div>

        {card.actionText && card.actionUrl && (
          <button
            onClick={() => router.push(card.actionUrl!)}
            className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 shrink-0 transition group cursor-pointer"
          >
            <span>{card.actionText}</span>
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Journey Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Application Stages Timeline</h4>
        <div className="relative border-l border-slate-800 ml-4 space-y-8 pb-4">
          {/* Step 1: Verification */}
          <div className="relative pl-6">
            <div className={`absolute left-0 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 ${currentStepIndex >= 2 ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-900 border-slate-700'}`}></div>
            <div className="space-y-0.5">
              <h5 className={`text-xs font-bold ${currentStepIndex >= 2 ? 'text-white' : 'text-slate-500'}`}>Email & Mobile OTP Verifications</h5>
              <p className="text-[10px] text-slate-500">Confirmed communication coordinates.</p>
            </div>
          </div>

          {/* Step 2: KYC */}
          <div className="relative pl-6">
            <div className={`absolute left-0 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 ${currentStepIndex >= 3 ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-900 border-slate-700'}`}></div>
            <div className="space-y-0.5">
              <h5 className={`text-xs font-bold ${currentStepIndex >= 3 ? 'text-white' : 'text-slate-500'}`}>KYC Uploads & Income Declarations</h5>
              <p className="text-[10px] text-slate-500">Government credentials and monthly income statement.</p>
            </div>
          </div>

          {/* Step 3: Terms selection */}
          <div className="relative pl-6">
            <div className={`absolute left-0 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 ${currentStepIndex >= 8 ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-900 border-slate-700'}`}></div>
            <div className="space-y-0.5">
              <h5 className={`text-xs font-bold ${currentStepIndex >= 8 ? 'text-white' : 'text-slate-500'}`}>Loan Terms Selection & Bank details</h5>
              <p className="text-[10px] text-slate-500">Confirming EMI tenures and coordinates for transfer.</p>
            </div>
          </div>

          {/* Step 4: Selfie & Consents */}
          <div className="relative pl-6">
            <div className={`absolute left-0 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 ${currentStepIndex >= 11 ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-900 border-slate-700'}`}></div>
            <div className="space-y-0.5">
              <h5 className={`text-xs font-bold ${currentStepIndex >= 11 ? 'text-white' : 'text-slate-500'}`}>Biometric Selfie & Review Queue</h5>
              <p className="text-[10px] text-slate-500">Identity face checks and admin file audits.</p>
            </div>
          </div>

          {/* Step 5: Disbursed */}
          <div className="relative pl-6">
            <div className={`absolute left-0 -translate-x-1/2 h-3.5 w-3.5 rounded-full border-2 ${app.status === 'DISBURSED' ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-900 border-slate-700'}`}></div>
            <div className="space-y-0.5">
              <h5 className={`text-xs font-bold ${app.status === 'DISBURSED' ? 'text-emerald-400' : 'text-slate-500'}`}>Disbursement & Loan Active</h5>
              <p className="text-[10px] text-slate-500">Deduction of processing fees and account transfer.</p>
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
