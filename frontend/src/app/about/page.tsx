import React from 'react';
import { Award, Briefcase, Eye, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-16 py-6 max-w-4xl mx-auto text-neutral-text animate-aurora">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-brand-blue tracking-tight">About EZFINANZ</h1>
        <p className="text-neutral-secondary text-sm max-w-xl mx-auto leading-relaxed">
          We are committed to making personal financing accessible, transparent, and completely digital for customers across India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <div className="bg-white border border-[#E4EAF0] p-6 rounded-2xl space-y-3 shadow-sm hover:border-brand-blue transition">
          <Eye className="h-8 w-8 text-brand-blue" />
          <h4 className="font-semibold text-neutral-text text-base">Our Vision</h4>
          <p className="text-xs text-neutral-secondary leading-relaxed">
            To become the most trusted consumer lending partner in India by integrating cutting-edge financial algorithms, secure biometric checks, and straightforward reducing-balance interest options.
          </p>
        </div>

        <div className="bg-white border border-[#E4EAF0] p-6 rounded-2xl space-y-3 shadow-sm hover:border-brand-blue transition">
          <Briefcase className="h-8 w-8 text-brand-blue" />
          <h4 className="font-semibold text-neutral-text text-base">Who We Are</h4>
          <p className="text-xs text-neutral-secondary leading-relaxed">
            EZFINANZ (under Bhalchandra Tech Private Limited) operates as a digital lending gateway. We build robust systems that connect applicants directly with credit assessment engines, eliminating intermediate bank queues.
          </p>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <h3 className="text-xl font-bold text-neutral-text tracking-tight">Our Core Principles</h3>
        <div className="space-y-6">
          <div className="flex gap-4">
            <ShieldCheck className="h-5 w-5 text-brand-green shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-neutral-text">Security First</h5>
              <p className="text-xs text-neutral-secondary mt-1">We utilize JWT encryption, standard secure file storage repositories, and liveness-based face verification checks to keep identity records protected.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Award className="h-5 w-5 text-brand-green shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-neutral-text">100% Digital Execution</h5>
              <p className="text-xs text-neutral-secondary mt-1">From initial registration down to the final loan disbursement and repayment scheduling, the customer onboarding experience is 100% digital and paperless.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
