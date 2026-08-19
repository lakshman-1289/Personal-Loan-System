import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, Fingerprint, Receipt } from 'lucide-react';

export default function Customer() {
  return (
    <div className="space-y-16 py-6 max-w-4xl mx-auto text-neutral-text">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-neutral-text tracking-tight">Customer Journey</h1>
        <p className="text-neutral-secondary text-sm max-w-xl mx-auto leading-relaxed">
          EZFINANZ provides a simple, transparent, and step-by-step path to secure a personal loan. Here is what you can expect during onboarding.
        </p>
      </div>

      {/* Onboarding Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="bg-white border border-[#E4EAF0] p-6 rounded-2xl flex gap-4 shadow-sm hover:border-brand-blue/50 transition duration-200">
          <BookOpen className="h-6 w-6 text-brand-blue shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-neutral-text text-base">1. Registration & OTP</h4>
            <p className="text-xs text-neutral-secondary mt-1 leading-relaxed">
              Register using your email address and mobile number. Confirm your contacts securely with instant OTP verification codes.
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4EAF0] p-6 rounded-2xl flex gap-4 shadow-sm hover:border-brand-blue/50 transition duration-200">
          <Fingerprint className="h-6 w-6 text-brand-blue shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-neutral-text text-base">2. KYC & Financial Details</h4>
            <p className="text-xs text-neutral-secondary mt-1 leading-relaxed">
              Upload your identification document (ID Card) and declare your monthly salary indicators to check your eligible lending amount.
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4EAF0] p-6 rounded-2xl flex gap-4 shadow-sm hover:border-brand-blue/50 transition duration-200">
          <Receipt className="h-6 w-6 text-brand-blue shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-neutral-text text-base">3. Terms Selection & Banking</h4>
            <p className="text-xs text-neutral-secondary mt-1 leading-relaxed">
              Select your customized loan amount and repayment tenure. Provide your bank account coordinates (IFSC and Account number) for disbursement.
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E4EAF0] p-6 rounded-2xl flex gap-4 shadow-sm hover:border-brand-blue/50 transition duration-200">
          <Clock className="h-6 w-6 text-brand-blue shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-neutral-text text-base">4. Consent & Selfie Verification</h4>
            <p className="text-xs text-neutral-secondary mt-1 leading-relaxed">
              Provide legal consent sign-offs and upload a camera selfie to confirm your identity. Our admin reviews and approves in minutes!
            </p>
          </div>
        </div>
      </div>

      <div className="bg-brand-light-blue border border-brand-blue/15 rounded-2xl p-8 text-center space-y-4 shadow-sm">
        <h3 className="text-xl font-bold text-brand-blue tracking-tight">Ready to Check Your Loan Eligibility?</h3>
        <p className="text-xs text-neutral-secondary max-w-md mx-auto">
          Start your application today. The initial eligibility test takes less than 2 minutes and has zero impact on your credit bureau record.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-green hover:bg-brand-dark-green text-white font-semibold text-xs rounded-lg transition duration-200 shadow-md shadow-brand-green/10 gap-2 group cursor-pointer"
        >
          <span>Apply Online Now</span>
          <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
