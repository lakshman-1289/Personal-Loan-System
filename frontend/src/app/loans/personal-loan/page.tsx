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
  ChevronRight
} from 'lucide-react';

export default function PersonalLoanPage() {
  return (
    <div className="space-y-24 py-6 max-w-6xl mx-auto text-neutral-text">
      
      {/* 1. Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-semibold rounded-full border border-brand-blue/20">
            <span className="h-2 w-2 rounded-full bg-brand-blue animate-pulse"></span>
            <span>Personal Loans</span>
          </div>
          <h1 className="text-4xl md:text-5.5xl font-extrabold tracking-tight leading-tight">
            Easy & Quick <br />
            <span className="bg-gradient-to-r from-brand-blue via-brand-blue to-brand-green bg-clip-text text-transparent">
              Personal Loans
            </span>
          </h1>
          <p className="text-neutral-secondary text-sm md:text-base leading-relaxed max-w-xl">
            Get instant personal loans up to ₹5 Lakhs with minimal paperwork and flexible repayment tenures of 6 to 36 months. Experience transparent processes and quick approvals tailored to your financial goals.
          </p>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 py-4 max-w-md">
            <div className="bg-brand-light-blue border border-[#E4EAF0] p-4 rounded-xl text-center">
              <div className="text-brand-blue font-extrabold text-lg md:text-xl">₹5 Lacs</div>
              <div className="text-[10px] text-neutral-secondary uppercase font-semibold mt-1">Max Loan Amount</div>
            </div>
            <div className="bg-brand-light-blue border border-[#E4EAF0] p-4 rounded-xl text-center">
              <div className="text-brand-blue font-extrabold text-lg md:text-xl">14% - 36%</div>
              <div className="text-[10px] text-neutral-secondary uppercase font-semibold mt-1">Interest Rate</div>
            </div>
            <div className="bg-brand-light-blue border border-[#E4EAF0] p-4 rounded-xl text-center">
              <div className="text-brand-blue font-extrabold text-lg md:text-xl">Minutes</div>
              <div className="text-[10px] text-neutral-secondary uppercase font-semibold mt-1">Quick Approval</div>
            </div>
          </div>

          {/* Inline features list */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-neutral-secondary font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-green" />
              <span>Minimal Documentation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-green" />
              <span>No Hidden Charges</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-green" />
              <span>100% Transparent Process</span>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-green hover:bg-brand-dark-green text-white font-semibold text-sm rounded-xl transition duration-200 shadow-lg shadow-brand-green/25 group cursor-pointer"
            >
              <span>Apply Now</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right Graphic Panel */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/5 to-brand-green/5 rounded-3xl blur-3xl -z-10"></div>
          <div className="bg-white border border-[#E4EAF0] rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="h-20 w-20 bg-brand-light-blue rounded-full flex items-center justify-center text-brand-blue mx-auto">
              <CircleDollarSign className="h-10 w-10 text-brand-blue" />
            </div>
            <div className="space-y-3 text-center">
              <h3 className="text-xl font-bold text-neutral-text">Flexible Repayment</h3>
              <p className="text-xs text-neutral-secondary leading-relaxed">
                Choose repayment tenures ranging from 6 to 36 months with competitive reducing-balance interest rates to match your monthly budget.
              </p>
            </div>
            
            <div className="bg-neutral-section border border-[#E4EAF0] rounded-2xl p-4 space-y-3 font-mono text-[10px] text-brand-blue">
              <div className="flex justify-between border-b border-[#E4EAF0] pb-2">
                <span className="text-neutral-secondary">Loan Tenure:</span>
                <span>6 to 36 Months</span>
              </div>
              <div className="flex justify-between border-b border-[#E4EAF0] pb-2">
                <span className="text-neutral-secondary">Interest Calculation:</span>
                <span>Reducing Balance</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-secondary">Collateral Required:</span>
                <span>Nil (Unsecured)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features & Benefits Section */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-text">Features & Benefits of Personal Loans</h2>
          <p className="text-neutral-secondary text-sm max-w-lg mx-auto">Flexible funding for your needs with transparent pricing and quick processing</p>
        </div>

        {/* Feature Cards Grid 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-[#E4EAF0] p-6 rounded-2xl space-y-4 hover:border-brand-blue transition duration-200 shadow-sm">
            <div className="h-10 w-10 bg-brand-light-blue rounded-lg flex items-center justify-center text-brand-blue">
              <Zap className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-neutral-text">Instant Approval</h4>
              <p className="text-xs text-neutral-secondary leading-relaxed">
                Get approved in just 5 minutes with our AI-powered assessment process.
              </p>
            </div>
            <div className="inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded">
              Under 5 mins
            </div>
          </div>

          <div className="bg-white border border-[#E4EAF0] p-6 rounded-2xl space-y-4 hover:border-brand-blue transition duration-200 shadow-sm">
            <div className="h-10 w-10 bg-brand-light-blue rounded-lg flex items-center justify-center text-brand-blue">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-neutral-text">100% Secure</h4>
              <p className="text-xs text-neutral-secondary leading-relaxed">
                Protect your data with bank-grade encryption and RBI compliant safety measures.
              </p>
            </div>
            <div className="inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded">
              RBI Approved
            </div>
          </div>

          <div className="bg-white border border-[#E4EAF0] p-6 rounded-2xl space-y-4 hover:border-brand-blue transition duration-200 shadow-sm">
            <div className="h-10 w-10 bg-brand-light-blue rounded-lg flex items-center justify-center text-brand-blue">
              <FileText className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-neutral-text">100% Paperless Process</h4>
              <p className="text-xs text-neutral-secondary leading-relaxed">
                Complete your loan journey — apply and get approval online in under 15 minutes.
              </p>
            </div>
            <div className="inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded">
              100% Digital
            </div>
          </div>

          <div className="bg-white border border-[#E4EAF0] p-6 rounded-2xl space-y-4 hover:border-brand-blue transition duration-200 shadow-sm">
            <div className="h-10 w-10 bg-brand-light-blue rounded-lg flex items-center justify-center text-brand-blue">
              <Clock className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-neutral-text">Quick Disbursal</h4>
              <p className="text-xs text-neutral-secondary leading-relaxed">
                Experience fast transfers — get your funds credited within 48 hours of approval.
              </p>
            </div>
            <div className="inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded">
              Same Day
            </div>
          </div>
        </div>

        {/* Feature Cards Grid 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          <div className="bg-neutral-section border border-[#E4EAF0] p-5 rounded-xl space-y-1.5">
            <h5 className="font-bold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-green" />
              No Hidden Charges
            </h5>
            <p className="text-[11px] text-neutral-secondary leading-relaxed">
              Transparent pricing with zero hidden application fees or advance charges.
            </p>
          </div>
          <div className="bg-neutral-section border border-[#E4EAF0] p-5 rounded-xl space-y-1.5">
            <h5 className="font-bold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-green" />
              Flexible Repayment
            </h5>
            <p className="text-[11px] text-neutral-secondary leading-relaxed">
              Choose tenures from 6 to 36 months that suit your monthly salary flow.
            </p>
          </div>
          <div className="bg-neutral-section border border-[#E4EAF0] p-5 rounded-xl space-y-1.5">
            <h5 className="font-bold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-green" />
              Anywhere & Anytime
            </h5>
            <p className="text-[11px] text-neutral-secondary leading-relaxed">
              Apply and track your loan from any device, wherever you are, at any time.
            </p>
          </div>
          <div className="bg-neutral-section border border-[#E4EAF0] p-5 rounded-xl space-y-1.5">
            <h5 className="font-bold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-green" />
              Minimal Documentation
            </h5>
            <p className="text-[11px] text-neutral-secondary leading-relaxed">
              Just Aadhaar, PAN, and bank statements — no complex physical paperwork.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Eligibility & Documentation Section */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-text">Eligibility & Documentation</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">Minimal requirements for a smooth application journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Eligibility Card */}
          <div className="bg-white border border-[#E4EAF0] p-8 rounded-2xl space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-brand-light-blue rounded-lg flex items-center justify-center text-brand-blue">
                <UserCheck className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-lg text-neutral-text">Eligibility Criteria</h3>
            </div>
            
            <ul className="space-y-3 text-xs text-neutral-secondary">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" />
                <span>Age: 18-61 years</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" />
                <span>Indian citizen</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" />
                <span>Salary with stable income source</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" />
                <span>Satisfactory credit score rating profile</span>
              </li>
            </ul>
          </div>

          {/* Documentation Card */}
          <div className="bg-white border border-[#E4EAF0] p-8 rounded-2xl space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-brand-light-blue rounded-lg flex items-center justify-center text-brand-blue">
                <FileText className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-lg text-neutral-text">Documents Required</h3>
            </div>

            <ul className="space-y-3 text-xs text-neutral-secondary">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" />
                <span>Identity proof (Aadhaar / PAN / Passport)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" />
                <span>Address proof (Utility bills / Rental agreement)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" />
                <span>Recent bank statements (last 6 months)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" />
                <span>Income proof (Salary slips / ITR)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" />
                <span>Employment or Business proof</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-brand-light-blue border border-brand-blue/10 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-brand-blue">Ready to experience hassle-free funding?</h3>
          <p className="text-xs text-neutral-secondary">Get started today by registering and checking your eligibility limit.</p>
        </div>
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 px-6 py-3 bg-brand-green hover:bg-brand-dark-green text-white font-semibold text-xs rounded-lg transition cursor-pointer"
        >
          <span>Apply For Loan</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </section>

    </div>
  );
}
