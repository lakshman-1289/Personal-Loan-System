import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[#E4EAF0] bg-neutral-section py-12 text-neutral-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand section */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img src="/logo.png" alt="EZFINANZ" className="h-6 w-auto object-contain" />
            </div>
            <p className="text-xs text-neutral-secondary max-w-xs leading-relaxed">
              Premium digital lending platform built in India. Instant approvals, transparent processes, and flexible repayments tailored for you.
            </p>
          </div>

          {/* Links: Loans */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-text mb-4">Loan Products</h4>
            <ul className="space-y-2 text-xs text-neutral-secondary">
              <li>
                <Link href="/loans/personal-loan" className="hover:text-brand-blue transition">
                  Personal Loans
                </Link>
              </li>
              <li>
                <span className="text-neutral-muted cursor-not-allowed">Consumer Durable Loans</span>
              </li>
              <li>
                <span className="text-neutral-muted cursor-not-allowed">Education Loans</span>
              </li>
            </ul>
          </div>

          {/* Links: Corporate */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-text mb-4">Company</h4>
            <ul className="space-y-2 text-xs text-neutral-secondary">
              <li>
                <Link href="/about" className="hover:text-brand-blue transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/customer" className="hover:text-brand-blue transition">
                  Customers Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand-blue transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-text mb-4">Support & Help</h4>
            <ul className="space-y-2 text-xs text-neutral-secondary">
              <li>
                <span className="hover:text-brand-blue cursor-pointer transition">Contact Us</span>
              </li>
              <li>
                <span className="hover:text-brand-blue cursor-pointer transition">FAQs & Help</span>
              </li>
              <li>
                <span className="hover:text-brand-blue cursor-pointer transition">Grievance Redressal</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#E4EAF0] pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-muted">
          <div>
            © {new Date().getFullYear()} EZFINANZ (Bhalchandra Tech Pvt Ltd). All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0 text-neutral-secondary">
            <span className="hover:text-brand-blue cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-brand-blue cursor-pointer transition">Terms of Service</span>
            <span className="hover:text-brand-blue cursor-pointer transition">Interest Rate Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
