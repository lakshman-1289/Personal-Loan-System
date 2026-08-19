'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Zap, 
  FileText, 
  CircleDollarSign,
  UserCheck,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function PersonalLoanPage() {
  return (
    <div className="space-y-24 py-6 max-w-6xl mx-auto">
      
      {/* 1. Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/20">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span>Personal Loans</span>
          </div>
          <h1 className="text-4xl md:text-5.5xl font-extrabold text-white tracking-tight leading-tight">
            Easy & Quick <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent">
              Personal Loans
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl">
            Get instant personal loans up to ₹5 Lakhs with minimal paperwork and flexible repayment tenures of 6 to 36 months. Experience transparent processes and quick approvals tailored to your financial goals.
          </p>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 py-4 max-w-md">
            <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl text-center">
              <div className="text-indigo-400 font-extrabold text-lg md:text-xl">₹5 Lacs</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold mt-1">Max Loan Amount</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl text-center">
              <div className="text-indigo-400 font-extrabold text-lg md:text-xl">14% - 36%</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold mt-1">Interest Rate</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl text-center">
              <div className="text-indigo-400 font-extrabold text-lg md:text-xl">Minutes</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold mt-1">Quick Approval</div>
            </div>
          </div>

          {/* Inline features list */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              <span>Minimal Documentation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              <span>No Hidden Charges</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              <span>100% Transparent Process</span>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition duration-200 shadow-lg shadow-indigo-600/25 group"
            >
              <span>Apply Now</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right Graphic Panel */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 rounded-3xl blur-3xl -z-10"></div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-850 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="h-20 w-20 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mx-auto">
              <CircleDollarSign className="h-10 w-10 animate-bounce" />
            </div>
            <div className="space-y-3 text-center">
              <h3 className="text-xl font-bold text-white">Flexible Repayment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose repayment tenures ranging from 6 to 36 months with competitive reducing-balance interest rates to match your monthly budget.
              </p>
            </div>
            
            <div className="bg-slate-950/60 border border-slate-855 rounded-2xl p-4 space-y-3 font-mono text-[10px] text-indigo-300">
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500">Loan Tenure:</span>
                <span>6 to 36 Months</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500">Interest Calculation:</span>
                <span>Reducing Balance</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Collateral Required:</span>
                <span>Nil (Unsecured)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features & Benefits Section */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">Features & Benefits of Personal Loans</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">Flexible funding for your needs with transparent pricing and quick processing</p>
        </div>

        {/* Feature Cards Grid 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4 hover:border-slate-800 transition">
            <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
              <Zap className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Instant Approval</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Get approved in just 5 minutes with our AI-powered assessment process.
              </p>
            </div>
            <div className="inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">
              Under 5 mins
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4 hover:border-slate-800 transition">
            <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">100% Secure</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Protect your data with bank-grade encryption and RBI compliant safety measures.
              </p>
            </div>
            <div className="inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">
              RBI Approved
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4 hover:border-slate-800 transition">
            <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
              <FileText className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">100% Paperless Process</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Complete your loan journey — apply and get approval online in under 15 minutes.
              </p>
            </div>
            <div className="inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">
              100% Digital
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4 hover:border-slate-800 transition">
            <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
              <Clock className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Quick Disbursal</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Experience fast transfers — get your funds credited within 48 hours of approval.
              </p>
            </div>
            <div className="inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">
              Same Day
            </div>
          </div>
        </div>

        {/* Feature Cards Grid 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          <div className="bg-slate-900/20 border border-slate-950 p-5 rounded-xl space-y-1.5">
            <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              No Hidden Charges
            </h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Transparent pricing with zero hidden application fees or advance charges.
            </p>
          </div>
          <div className="bg-slate-900/20 border border-slate-950 p-5 rounded-xl space-y-1.5">
            <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Flexible Repayment
            </h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Choose tenures from 6 to 36 months that suit your monthly salary flow.
            </p>
          </div>
          <div className="bg-slate-900/20 border border-slate-950 p-5 rounded-xl space-y-1.5">
            <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Anywhere & Anytime
            </h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Apply and track your loan from any device, wherever you are, at any time.
            </p>
          </div>
          <div className="bg-slate-900/20 border border-slate-950 p-5 rounded-xl space-y-1.5">
            <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Minimal Documentation
            </h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Just Aadhaar, PAN, and bank statements — no complex physical paperwork.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Eligibility & Documentation Section */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">Eligibility & Documentation</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">Minimal requirements for a smooth application journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Eligibility Card */}
          <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                <UserCheck className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-white text-lg">Eligibility Criteria</h3>
            </div>
            
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Age: 18-61 years</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Indian citizen</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Salary with stable income source</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Satisfactory credit score rating profile</span>
              </li>
            </ul>
          </div>

          {/* Documentation Card */}
          <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                <FileText className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-white text-lg">Documents Required</h3>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Identity proof (Aadhaar / PAN / Passport)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Address proof (Utility bills / Rental agreement)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Recent bank statements (last 6 months)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Income proof (Salary slips / ITR)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Employment or Business proof</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-slate-900/50 border border-indigo-500/20 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-white">Ready to experience hassle-free funding?</h3>
          <p className="text-xs text-slate-400">Get started today by registering and checking your eligibility limit.</p>
        </div>
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition"
        >
          <span>Apply For Loan</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </section>

    </div>
  );
}
