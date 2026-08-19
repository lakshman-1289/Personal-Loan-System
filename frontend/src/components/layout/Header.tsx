'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Menu, X } from 'lucide-react';

export default function Header() {
  const { session, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    setIsMenuOpen(false);
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="border-b border-[#E4EAF0] bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center group shrink-0" onClick={() => setIsMenuOpen(false)}>
          <img src="/logo.png" alt="EZFINANZ" className="h-6 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center justify-center space-x-8 text-sm font-medium text-neutral-secondary flex-1 px-8">
          <Link
            href="/"
            className={`hover:text-brand-blue transition-colors duration-200 ${isActive('/') ? 'text-brand-blue font-semibold' : ''}`}
          >
            Home
          </Link>
          <Link
            href="/loans/personal-loan"
            className={`hover:text-brand-blue transition-colors duration-200 ${isActive('/loans/personal-loan') ? 'text-brand-blue font-semibold' : ''}`}
          >
            Personal Loans
          </Link>
          <Link
            href="/about"
            className={`hover:text-brand-blue transition-colors duration-200 ${isActive('/about') ? 'text-brand-blue font-semibold' : ''}`}
          >
            About Us
          </Link>
          <Link
            href="/customer"
            className={`hover:text-brand-blue transition-colors duration-200 ${isActive('/customer') ? 'text-brand-blue font-semibold' : ''}`}
          >
            Customers
          </Link>
          <Link
            href={session?.role === 'ADMIN' ? '/admin' : '/dashboard'}
            className={`hover:text-brand-blue transition-colors duration-200 ${isActive(session?.role === 'ADMIN' ? '/admin' : '/dashboard') ? 'text-brand-blue font-semibold' : ''}`}
          >
            Dashboard
          </Link>
        </nav>

        {/* Desktop Session Buttons */}
        <div className="hidden md:flex items-center space-x-4 shrink-0">
          {session ? (
            <>
              <div className="flex items-center space-x-2 bg-brand-light-blue px-3 py-1.5 rounded-full border border-[#E4EAF0]">
                <span className="h-2 w-2 rounded-full bg-brand-green animate-pulse"></span>
                <span className="text-xs font-medium text-brand-blue">{session.email}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-blue/15 text-brand-blue rounded flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  {session.role}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm font-semibold text-neutral-secondary hover:text-brand-blue transition duration-200 cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="space-x-4 flex items-center">
              <Link href="/login" className="text-sm font-semibold text-neutral-secondary hover:text-brand-blue transition duration-200">
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-brand-green hover:bg-brand-dark-green rounded-lg transition duration-200 shadow-md shadow-brand-green/10"
              >
                Apply Now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg text-neutral-secondary hover:text-brand-blue focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[#E4EAF0] bg-white px-4 py-4 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-neutral-secondary">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className={`px-2 py-1.5 rounded-lg hover:bg-neutral-section hover:text-brand-blue transition ${isActive('/') ? 'text-brand-blue bg-brand-light-blue font-semibold' : ''}`}
            >
              Home
            </Link>
            <Link
              href="/loans/personal-loan"
              onClick={() => setIsMenuOpen(false)}
              className={`px-2 py-1.5 rounded-lg hover:bg-neutral-section hover:text-brand-blue transition ${isActive('/loans/personal-loan') ? 'text-brand-blue bg-brand-light-blue font-semibold' : ''}`}
            >
              Personal Loans
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMenuOpen(false)}
              className={`px-2 py-1.5 rounded-lg hover:bg-neutral-section hover:text-brand-blue transition ${isActive('/about') ? 'text-brand-blue bg-brand-light-blue font-semibold' : ''}`}
            >
              About Us
            </Link>
            <Link
              href="/customer"
              onClick={() => setIsMenuOpen(false)}
              className={`px-2 py-1.5 rounded-lg hover:bg-neutral-section hover:text-brand-blue transition ${isActive('/customer') ? 'text-brand-blue bg-brand-light-blue font-semibold' : ''}`}
            >
              Customers
            </Link>
            <Link
              href={session?.role === 'ADMIN' ? '/admin' : '/dashboard'}
              onClick={() => setIsMenuOpen(false)}
              className={`px-2 py-1.5 rounded-lg hover:bg-neutral-section hover:text-brand-blue transition ${isActive(session?.role === 'ADMIN' ? '/admin' : '/dashboard') ? 'text-brand-blue bg-brand-light-blue font-semibold' : ''}`}
            >
              Dashboard
            </Link>
          </nav>

          <hr className="border-[#E4EAF0]" />

          {/* Mobile Actions */}
          <div className="flex flex-col space-y-3 px-2">
            {session ? (
              <>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-brand-green animate-pulse"></span>
                    <span className="text-xs font-semibold text-neutral-text truncate">{session.email}</span>
                  </div>
                  <div className="inline-flex self-start items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-blue/15 text-brand-blue rounded">
                    <ShieldCheck className="h-3 w-3" />
                    {session.role}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full py-2 bg-neutral-section hover:bg-[#E4EAF0] text-sm font-semibold text-neutral-text rounded-lg transition text-center cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full py-2 border border-[#E4EAF0] text-sm font-semibold text-neutral-text rounded-lg transition text-center hover:bg-neutral-section"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full py-2 bg-brand-green hover:bg-brand-dark-green text-white text-sm font-semibold rounded-lg transition text-center shadow-md shadow-brand-green/10"
                >
                  Apply Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
