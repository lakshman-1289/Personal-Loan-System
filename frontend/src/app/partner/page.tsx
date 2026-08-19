import React from 'react';
import { Award, CheckCircle2, HelpCircle, ShieldCheck } from 'lucide-react';

export default function Partner() {
  return (
    <div className="space-y-16 py-6 max-w-4xl mx-auto text-neutral-text animate-aurora">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-brand-blue tracking-tight">Partner With EZFINANZ</h1>
        <p className="text-neutral-secondary text-sm max-w-xl mx-auto leading-relaxed">
          Enable instant financing options for your retail store, e-commerce shop, or digital service platform. Partner with EZFINANZ to boost conversions.
        </p>
      </div>

      {/* Value Propositions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E4EAF0] p-6 rounded-xl space-y-3 shadow-sm hover:border-brand-blue transition">
          <CheckCircle2 className="h-6 w-6 text-brand-green" />
          <h4 className="font-semibold text-neutral-text text-sm">Minimal Documentation</h4>
          <p className="text-xs text-neutral-secondary leading-relaxed">Customers complete registrations paperlessly using active mobile validations and digitised files upload.</p>
        </div>
        <div className="bg-white border border-[#E4EAF0] p-6 rounded-xl space-y-3 shadow-sm hover:border-brand-blue transition">
          <Award className="h-6 w-6 text-brand-green" />
          <h4 className="font-semibold text-neutral-text text-sm">Flexible Repayments</h4>
          <p className="text-xs text-neutral-secondary leading-relaxed">Multiple repayment months choices (12, 24, or 36) allowing consumers to pick tenure periods aligning with their monthly budget.</p>
        </div>
        <div className="bg-white border border-[#E4EAF0] p-6 rounded-xl space-y-3 shadow-sm hover:border-brand-blue transition">
          <ShieldCheck className="h-6 w-6 text-brand-green" />
          <h4 className="font-semibold text-neutral-text text-sm">No Hidden Charges</h4>
          <p className="text-xs text-neutral-secondary leading-relaxed">Flat processing fee (2.0%) and reducing interest models. Absolutely no surprises or security deposits requested.</p>
        </div>
      </div>

      {/* Partner FAQs */}
      <div className="space-y-6 pt-4">
        <h3 className="text-xl font-bold text-neutral-text tracking-tight flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-brand-blue" />
          Partner FAQs
        </h3>
        <div className="space-y-6">
          <div className="border-l-2 border-brand-blue pl-4 space-y-1">
            <h5 className="text-xs uppercase font-bold tracking-wider text-neutral-secondary">How do merchants integrate EZFINANZ?</h5>
            <p className="text-xs text-neutral-secondary leading-relaxed">We expose digital onboarding APIs. Customers checkout, select EZFINANZ, fill in their KYC details on our portal, and return once approved.</p>
          </div>
          <div className="border-l-2 border-brand-blue pl-4 space-y-1">
            <h5 className="text-xs uppercase font-bold tracking-wider text-neutral-secondary">Who is eligible to partner with us?</h5>
            <p className="text-xs text-neutral-secondary leading-relaxed">Registered businesses operating retail chains, medical clinics, educational organizations, or e-commerce sites in India can register as partners.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
