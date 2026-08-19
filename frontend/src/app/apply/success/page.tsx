import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="max-w-md mx-auto my-16 text-center space-y-6 bg-slate-900 border border-slate-800 p-10 rounded-2xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

      <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400">
        <CheckCircle2 className="h-10 w-10 animate-bounce" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">Onboarding Submitted!</h2>
        <p className="text-slate-400 text-xs leading-relaxed">
          Your personal loan application has been successfully filed. All parameters are compiled and sent to the administrator review queue.
        </p>
      </div>

      <div className="p-4 bg-slate-950/60 rounded-xl text-xs text-indigo-300 font-mono text-center">
        Status: SELFIE_UNDER_REVIEW
      </div>

      <hr className="border-slate-850" />

      <Link
        href="/dashboard"
        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span>Track Status in Dashboard</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
