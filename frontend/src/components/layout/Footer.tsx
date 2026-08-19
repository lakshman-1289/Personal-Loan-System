import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-905 bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
                EZ
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                EZFINANZ
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Premium digital lending platform built in India. Instant approvals, transparent processes, and flexible repayments tailored for you.
            </p>
          </div>

          {/* Links: Loans */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Loan Products</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <Link href="/loans/personal-loan" className="hover:text-slate-300 transition">
                  Personal Loans
                </Link>
              </li>
              <li>
                <span className="text-slate-600 cursor-not-allowed">Consumer Durable Loans</span>
              </li>
              <li>
                <span className="text-slate-600 cursor-not-allowed">Education Loans</span>
              </li>
            </ul>
          </div>

          {/* Links: Corporate */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Company</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <Link href="/about" className="hover:text-slate-300 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/customer" className="hover:text-slate-300 transition">
                  Customers Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-slate-300 transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Support */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Support & Help</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <span className="hover:text-slate-300 cursor-pointer transition">Contact Us</span>
              </li>
              <li>
                <span className="hover:text-slate-300 cursor-pointer transition">FAQs & Help</span>
              </li>
              <li>
                <span className="hover:text-slate-300 cursor-pointer transition">Grievance Redressal</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-900/60 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-600">
          <div>
            © {new Date().getFullYear()} EZFINANZ (Bhalchandra Tech Pvt Ltd). All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="hover:text-slate-400 cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer transition">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer transition">Interest Rate Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
