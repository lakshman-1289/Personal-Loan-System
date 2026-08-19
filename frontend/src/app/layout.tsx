import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import '../index.css';

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
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-text flex flex-col font-sans antialiased selection:bg-brand-blue selection:text-white">
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
