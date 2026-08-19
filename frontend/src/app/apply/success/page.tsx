import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="max-w-md mx-auto my-16 text-center space-y-6 bg-white border border-[#E4EAF0] p-10 rounded-2xl shadow-lg relative overflow-hidden text-neutral-text">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue to-brand-green"></div>

      <div className="h-16 w-16 bg-brand-light-green rounded-full flex items-center justify-center mx-auto text-brand-green">
        <CheckCircle2 className="h-10 w-10 animate-bounce" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-neutral-text tracking-tight">Onboarding Submitted!</h2>
        <p className="text-neutral-secondary text-xs leading-relaxed">
          Your personal loan application has been successfully filed. All parameters are compiled and sent to the administrator review queue.
        </p>
      </div>

      <div className="p-4 bg-brand-light-blue border border-brand-blue/10 rounded-xl text-xs text-brand-blue font-mono text-center">
        Status: SELFIE_UNDER_REVIEW
      </div>

      <hr className="border-[#E4EAF0]" />

      <Link
        href="/dashboard"
        className="w-full py-3.5 bg-brand-green hover:bg-brand-dark-green text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-brand-green/10 flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span>Track Status in Dashboard</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
