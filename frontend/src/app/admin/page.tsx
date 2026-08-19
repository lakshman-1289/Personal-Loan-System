'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { AlertCircle, ArrowRight, ClipboardList, Loader2 } from 'lucide-react';

interface SummaryData {
  applicationId: number;
  applicantName: string;
  requestedAmount: number;
  tenureMonths: number | null;
  status: string;
  submittedAt: string;
}

export default function AdminDashboard() {
  const { session, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<SummaryData[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!session) {
        router.replace('/login');
      } else if (session.role !== 'ADMIN') {
        router.replace('/dashboard');
      }
    }
  }, [session, authLoading, router]);

  // Fetch summaries
  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = statusFilter 
        ? `/api/v1/admin/applications?status=${statusFilter}&size=50`
        : '/api/v1/admin/applications?size=50';
      const response = await axios.get(url);
      setApplications(response.data.content || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve administrative applications queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && session.role === 'ADMIN') {
      fetchApplications();
    }
  }, [session, statusFilter]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 text-brand-blue animate-spin" />
        <span className="text-xs text-neutral-secondary">Retrieving audit queue...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-[#E4EAF0] p-8 rounded-2xl shadow-lg text-center space-y-4 text-neutral-text">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-neutral-text">Administrative Access Failed</h3>
        <p className="text-xs text-neutral-secondary">{error}</p>
        <button
          onClick={fetchApplications}
          className="px-4 py-2 bg-brand-green hover:bg-brand-dark-green text-white text-xs font-semibold rounded-lg cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  // Visual status badge styles
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'SELFIE_UNDER_REVIEW':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'APPROVED':
      case 'SELFIE_APPROVED':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'DISBURSED':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'REJECTED':
      case 'SELFIE_REJECTED':
      case 'NOT_ELIGIBLE':
        return 'bg-rose-100 text-rose-800 border border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 text-neutral-text">
      {/* Intro Banner */}
      <div className="bg-white border border-[#E4EAF0] rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-neutral-section rounded-xl border border-[#E4EAF0]">
            <ClipboardList className="h-7 w-7 text-brand-blue" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-text">Lending Audit Queue</h1>
            <p className="text-neutral-secondary text-xs leading-relaxed max-w-xl">
              Inspect loan applicant journeys, verify uploaded identity selfies, and execute bank disbursements.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex gap-4 items-center bg-white border border-[#E4EAF0] rounded-xl p-4">
        <span className="text-xs font-semibold text-neutral-secondary uppercase tracking-wider">Filter Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-[#E4EAF0] rounded-lg px-3 py-1.5 text-xs text-neutral-text focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
        >
          <option value="">All Applications</option>
          <option value="SELFIE_UNDER_REVIEW">Awaiting Selfie Review</option>
          <option value="APPROVED">Approved / Ready to Disburse</option>
          <option value="DISBURSED">Active / Disbursed</option>
          <option value="REJECTED">Rejected Loans</option>
        </select>
      </div>

      {/* Table queue */}
      <div className="bg-white border border-[#E4EAF0] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E4EAF0]">
            <thead className="bg-neutral-section">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-secondary">ID</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-secondary">Applicant</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-secondary">Requested Amount</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-secondary">Tenure</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-secondary">Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-secondary">Submitted At</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-neutral-secondary">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4EAF0] bg-white text-xs">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-secondary">
                    No applications currently match the query filters.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-neutral-section/50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-brand-blue">#EZ-{app.applicationId}</td>
                    <td className="px-6 py-4 text-neutral-text font-semibold">{app.applicantName}</td>
                    <td className="px-6 py-4 text-neutral-text">₹{app.requestedAmount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-neutral-secondary">{app.tenureMonths ? `${app.tenureMonths} Mo` : '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getBadgeStyle(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-secondary">
                      {new Date(app.submittedAt).toLocaleDateString('en-IN')} {new Date(app.submittedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => router.push(`/admin/applications/${app.applicationId}`)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-neutral-section border border-[#E4EAF0] text-neutral-text px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        <span>Audit</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
