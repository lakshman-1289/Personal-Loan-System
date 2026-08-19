'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronDown, Percent, Sparkles, TrendingUp } from 'lucide-react';

export default function Home() {
  // Calculator States
  const [amount, setAmount] = useState(200000);
  const [tenure, setTenure] = useState(24);
  const [emi, setEmi] = useState(0);
  const [processingFee, setProcessingFee] = useState(0);
  const [gst, setGst] = useState(0);
  const [netDisbursed, setNetDisbursed] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);

  const interestRate = 12.0; // Default backend rate

  // Recalculate parameters when sliders move
  useEffect(() => {
    const P = amount;
    const n = tenure;
    const r = interestRate / 12 / 100;

    // Monthly Reducing Balance EMI Formula
    const calculatedEmi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const fee = P * 0.02; // 2% processing fee
    const calculatedGst = fee * 0.18; // 18% GST on fee
    const disbursed = P - fee - calculatedGst;
    const payable = calculatedEmi * n;
    const interest = payable - P;

    setEmi(Math.round(calculatedEmi));
    setProcessingFee(Math.round(fee));
    setGst(Math.round(calculatedGst));
    setNetDisbursed(Math.round(disbursed));
    setTotalPayable(Math.round(payable));
    setTotalInterest(Math.round(interest));
  }, [amount, tenure]);

  // Accordion FAQ helper
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "What is the minimum and maximum loan amount I can apply for?",
      a: "Depending on your credit profile and self-declared monthly income, you can request loan amounts starting from ₹10,000 up to ₹5,00,000 through the EZFINANZ digital onboarding portal."
    },
    {
      q: "How long does it take for my loan application to get reviewed?",
      a: "Once your digital KYC, bank coordinates, and selfie validation checks are submitted, our administrators review the file in real-time. Approved loans are usually disbursed within 24 hours."
    },
    {
      q: "Are there any hidden fees or security deposits required?",
      a: "No, EZFINANZ stands for absolute transparency. We only charge a standard 2.0% processing fee (+18% GST) which is deducted directly from your disbursed amount. No advance fees are ever requested."
    },
    {
      q: "How is the monthly interest rate calculated?",
      a: "All personal loans are calculated using a standard reducing balance interest method, set at a default annual interest rate of 12.0%."
    }
  ];

  return (
    <div className="space-y-20 py-6">
      {/* 1. Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto py-12 relative">
        <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/20">
          <Sparkles className="h-3 w-3 animate-pulse" />
          <span>100% Digital Personal Loans in India</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Easy Financing. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent">
            Built Around You.
          </span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Skip the bank queues. Apply for instant personal loans up to ₹5 Lakhs online with simple KYC verification, transparent reducing-balance interest terms, and flexible EMI repayments.
        </p>
        <div className="flex items-center justify-center pt-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition duration-200 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 group"
          >
            <span>Apply For Loan</span>
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* 2. Interactive Calculator Section */}
      <section className="bg-slate-900/60 border border-slate-900 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Sliders column */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Interactive EMI Calculator</h2>
              <p className="text-slate-400 text-xs mt-1">Estimate your repayments and interest breaks instantly</p>
            </div>

            {/* Slider 1: Amount */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loan Amount</span>
                <span className="text-lg font-bold text-white">₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="500000"
                step="5000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>₹10,000</span>
                <span>₹500,000</span>
              </div>
            </div>

            {/* Slider 2: Tenure */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Repayment Tenure</span>
                <span className="text-lg font-bold text-white">{tenure} Months</span>
              </div>
              <input
                type="range"
                min="12"
                max="36"
                step="12"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>12 Months</span>
                <span>24 Months</span>
                <span>36 Months</span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Interest Rate</div>
                <div className="text-xs font-bold text-slate-200 mt-1 flex items-center justify-center gap-1">
                  <Percent className="h-3 w-3 text-indigo-400" />
                  {interestRate}% p.a.
                </div>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Processing Fee (2%)</div>
                <div className="text-xs font-bold text-slate-200 mt-1">₹{processingFee.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">GST on Fee (18%)</div>
                <div className="text-xs font-bold text-slate-200 mt-1">₹{gst.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          {/* Results column */}
          <div className="bg-slate-950/80 border border-slate-855 rounded-2xl p-8 space-y-6">
            <div className="text-center">
              <div className="text-xs uppercase font-bold tracking-wider text-slate-500">Monthly Installment (EMI)</div>
              <div className="text-4xl md:text-5xl font-extrabold text-white mt-2">
                ₹{emi.toLocaleString('en-IN')}
                <span className="text-xs font-semibold text-slate-500">/mo</span>
              </div>
            </div>

            <hr className="border-slate-900" />

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Net Loan Amount Disbursed</span>
                <span className="font-semibold text-white">₹{netDisbursed.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Interest Payable</span>
                <span className="font-semibold text-white">₹{totalInterest.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Amount Payable</span>
                <span className="font-semibold text-indigo-400 font-bold">₹{totalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Link
              href="/register"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-center block transition shadow-lg shadow-indigo-600/10 text-sm"
            >
              Get Started with This Loan
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Product Benefits */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">Why Choose EZFINANZ?</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">Absolute transparency, security, and digital-first operations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl flex items-start gap-4">
            <CheckCircle2 className="h-6 w-6 text-indigo-500 shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-white text-base">100% Paperless Onboarding</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                No bank visits or paper trails. Submit document photos, check eligibility scores, and upload files completely online.
              </p>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl flex items-start gap-4">
            <TrendingUp className="h-6 w-6 text-indigo-500 shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-white text-base">Reducing Balance Interest</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Interest is computed only on the outstanding principal balance. We use standardized banking calculations with no surprises.
              </p>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl flex items-start gap-4">
            <Percent className="h-6 w-6 text-indigo-500 shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-white text-base">Clear Flat Pricing</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                We deduct the processing fees and GST directly from the disbursement. You know exactly what reaches your account down to the rupee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ Section */}
      <section className="space-y-8 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-slate-900/40 border border-slate-900 rounded-xl overflow-hidden cursor-pointer transition"
              onClick={() => toggleFaq(i)}
            >
              <div className="p-4 flex items-center justify-between text-sm font-semibold text-slate-200">
                <span>{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-slate-500 transition duration-200 ${openFaq === i ? 'rotate-180 text-white' : ''}`} />
              </div>
              {openFaq === i && (
                <div className="px-4 pb-4 text-xs text-slate-500 border-t border-slate-950/40 pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
