'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { AlertCircle, ArrowRight, FileCheck, FolderOpen, Loader2 } from 'lucide-react';

export default function KycStep() {
  const { session } = useAuth();
  const [appId, setAppId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('MALE');
  const [address, setAddress] = useState('');
  const [idType, setIdType] = useState('AADHAAR');
  const [idNumber, setIdNumber] = useState('');
  
  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const router = useRouter();

  // Retrieve active application
  useEffect(() => {
    if (!session) {
      router.replace('/login');
      return;
    }
    const fetchApp = async () => {
      try {
        const response = await axios.post('/api/v1/applications');
        setAppId(response.data.applicationId);
        
        // Populate if details already exist
        const kycRes = await axios.get(`/api/v1/kyc/${response.data.applicationId}`);
        if (kycRes.data) {
          setFullName(kycRes.data.fullName || '');
          setDateOfBirth(kycRes.data.dateOfBirth || '');
          setGender(kycRes.data.gender || 'MALE');
          setAddress(kycRes.data.address || '');
          setIdType(kycRes.data.idType || 'AADHAAR');
          setIdNumber(kycRes.data.idNumber || '');
          setDocumentUrl(kycRes.data.documentUrl || '');
        }
      } catch (e) {
        // KYC details might not exist yet, which is expected
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [session, router]);

  // Handle Document Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      const response = await axios.post(`/api/v1/kyc/${appId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setDocumentUrl(response.data.documentUrl);
    } catch (err: any) {
      setError('File upload failed. Only JPEGs and PNGs are allowed.');
    } finally {
      setUploading(false);
    }
  };

  // Submit KYC Details Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentUrl) {
      setError('Please upload your ID document before submitting.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      await axios.post(`/api/v1/kyc/${appId}`, {
        fullName,
        dateOfBirth,
        gender,
        address,
        idType,
        idNumber,
        documentUrl,
      });
      router.push('/apply/financials');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit KYC details. Please check constraints.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 text-brand-blue animate-spin" />
        <span className="text-xs text-neutral-secondary">Retrieving application status...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 py-6 text-neutral-text">
      {/* Visual Stepper */}
      <div className="flex items-center justify-between text-xs text-neutral-secondary bg-brand-light-blue border border-[#E4EAF0] rounded-full px-6 py-3">
        <span className="text-brand-blue font-bold">1. KYC Details</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span>2. Financials</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span>3. Selected Terms</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span>4. Bank details</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span>5. Sign Declarations</span>
      </div>

      <div className="bg-white border border-[#E4EAF0] p-8 rounded-2xl shadow-lg relative">
        <h2 className="text-2xl font-bold text-neutral-text tracking-tight mb-2">Personal & KYC Details</h2>
        <p className="text-neutral-secondary text-xs mb-8">Please enter details exactly as they appear on your government documents.</p>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-secondary">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white border border-[#E4EAF0] text-neutral-text rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition duration-200"
                placeholder="Applicant full name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-secondary">Date of Birth</label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-white border border-[#E4EAF0] text-neutral-text rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-secondary">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-white border border-[#E4EAF0] text-neutral-text rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition duration-200"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-secondary">ID Document Type</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full bg-white border border-[#E4EAF0] text-neutral-text rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition duration-200"
              >
                <option value="AADHAAR">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="PASSPORT">Passport</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-secondary">ID Document Number</label>
              <input
                type="text"
                required
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full bg-white border border-[#E4EAF0] text-neutral-text rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition duration-200"
                placeholder="ID credential number"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-secondary">Current Address</label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white border border-[#E4EAF0] text-neutral-text rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition duration-200 resize-none"
                placeholder="Residential coordinates"
              />
            </div>
          </div>

          <hr className="border-[#E4EAF0]" />

          {/* Document Upload Area */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-neutral-text uppercase tracking-wider">Upload Verification Document (ID Front)</h4>
            <div className="bg-neutral-section border-2 border-dashed border-[#E4EAF0] rounded-2xl p-6 text-center hover:border-brand-blue transition relative">
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <div className="space-y-2 flex flex-col items-center">
                {uploading ? (
                  <>
                    <Loader2 className="h-8 w-8 text-brand-blue animate-spin" />
                    <span className="text-xs text-neutral-secondary">Uploading document image...</span>
                  </>
                ) : documentUrl ? (
                  <>
                    <FileCheck className="h-8 w-8 text-brand-green" />
                    <span className="text-xs text-brand-green font-semibold">Document upload complete!</span>
                    <span className="text-[10px] text-neutral-secondary truncate max-w-xs">{documentUrl}</span>
                  </>
                ) : (
                  <>
                    <FolderOpen className="h-8 w-8 text-neutral-secondary" />
                    <span className="text-xs text-neutral-secondary">Click or drag image file here (JPEG/PNG only)</span>
                    <span className="text-[10px] text-neutral-muted">Max size 5MB</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full py-3.5 bg-brand-green hover:bg-brand-dark-green text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-brand-green/10 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            <span>Save & Continue</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
