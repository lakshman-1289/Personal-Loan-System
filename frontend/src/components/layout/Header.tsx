'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function Header() {
  const { session, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="border-b border-slate-900 bg-slate-955/85 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group shrink-0">
          <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 transition group-hover:scale-105">
            EZ
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            EZFINANZ
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center justify-center space-x-6 text-sm font-medium text-slate-400 flex-1 px-8">
          <Link
            href="/"
            className={`hover:text-white transition ${isActive('/') ? 'text-white font-semibold' : ''}`}
          >
            Home
          </Link>
          <Link
            href="/loans/personal-loan"
            className={`hover:text-white transition ${isActive('/loans/personal-loan') ? 'text-white font-semibold' : ''}`}
          >
            Personal Loans
          </Link>
          <Link
            href="/about"
            className={`hover:text-white transition ${isActive('/about') ? 'text-white font-semibold' : ''}`}
          >
            About Us
          </Link>
          <Link
            href="/customer"
            className={`hover:text-white transition ${isActive('/customer') ? 'text-white font-semibold' : ''}`}
          >
            Customers
          </Link>
          <Link
            href={session?.role === 'ADMIN' ? '/admin' : '/dashboard'}
            className={`hover:text-white transition ${isActive(session?.role === 'ADMIN' ? '/admin' : '/dashboard') ? 'text-white font-semibold' : ''}`}
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-medium text-slate-300">{session.email}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  {session.role}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm font-semibold text-slate-400 hover:text-white transition duration-200 cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="space-x-4 flex items-center">
              <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition duration-200">
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition duration-200 shadow-md shadow-indigo-600/10"
              >
                Apply Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
