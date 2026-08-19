import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, Fingerprint, Receipt } from 'lucide-react';

export default function Customer() {
  return (
    <div className="space-y-16 py-6 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Customer Journey</h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          EZFINANZ provides a simple, transparent, and step-by-step path to secure a personal loan. Here is what you can expect during onboarding.
        </p>
      </div>

      {/* Onboarding Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl flex gap-4">
          <BookOpen className="h-6 w-6 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white text-base">1. Registration & OTP</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Register using your email address and mobile number. Confirm your contacts securely with instant OTP verification codes.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl flex gap-4">
          <Fingerprint className="h-6 w-6 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white text-base">2. KYC & Financial Details</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload your identification document (ID Card) and declare your monthly salary indicators to check your eligible lending amount.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl flex gap-4">
          <Receipt className="h-6 w-6 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white text-base">3. Terms Selection & Banking</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Select your customized loan amount and repayment tenure. Provide your bank account coordinates (IFSC and Account number) for disbursement.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl flex gap-4">
          <Clock className="h-6 w-6 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white text-base">4. Consent & Selfie Verification</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Provide legal consent sign-offs and upload a camera selfie to confirm your identity. Our admin reviews and approves in minutes!
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-900/30 to-violet-900/30 border border-indigo-900/40 rounded-2xl p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-white tracking-tight">Ready to Check Your Loan Eligibility?</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Start your application today. The initial eligibility test takes less than 2 minutes and has zero impact on your credit bureau record.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition duration-200 shadow-md shadow-indigo-600/10 gap-2 group"
        >
          <span>Apply Online Now</span>
          <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
