import React from 'react';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import '../index.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'EZFINANZ | Digital Personal Loans',
  description: 'Premium Indian Fintech Lending Platform. Instant eligibility and digital loan process.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-neutral-bg text-neutral-body flex flex-col font-sans antialiased selection:bg-brand-blue selection:text-white">
        <AuthProvider>
          <Header />
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
