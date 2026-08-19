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
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-500">Retrieving audit queue...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Administrative Access Failed</h3>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={fetchApplications}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
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
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'APPROVED':
      case 'SELFIE_APPROVED':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'DISBURSED':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'REJECTED':
      case 'SELFIE_REJECTED':
      case 'NOT_ELIGIBLE':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-slate-800/60 text-slate-400 border border-slate-700/60';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      {/* Intro Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-850">
            <ClipboardList className="h-7 w-7 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">Lending Audit Queue</h1>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
              Inspect loan applicant journeys, verify uploaded identity selfies, and execute bank disbursements.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex gap-4 items-center bg-slate-900 border border-slate-800 rounded-xl p-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-955 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Applications</option>
          <option value="SELFIE_UNDER_REVIEW">Awaiting Selfie Review</option>
          <option value="APPROVED">Approved / Ready to Disburse</option>
          <option value="DISBURSED">Active / Disbursed</option>
          <option value="REJECTED">Rejected Loans</option>
        </select>
      </div>

      {/* Table queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-855">
            <thead className="bg-slate-950">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">ID</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Applicant</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Requested Amount</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Tenure</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Submitted At</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-855 bg-slate-900/40 text-xs">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No applications currently match the query filters.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-slate-955/20 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-300">#EZ-{app.applicationId}</td>
                    <td className="px-6 py-4 text-white font-semibold">{app.applicantName}</td>
                    <td className="px-6 py-4 text-slate-200">₹{app.requestedAmount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-slate-400">{app.tenureMonths ? `${app.tenureMonths} Mo` : '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getBadgeStyle(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(app.submittedAt).toLocaleDateString('en-IN')} {new Date(app.submittedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => router.push(`/admin/applications/${app.applicationId}`)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-slate-950 hover:bg-slate-900 hover:text-white text-slate-300 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
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
