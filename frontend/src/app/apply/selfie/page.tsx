'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { AlertCircle, Camera, ChevronLeft, FileImage, Loader2, RotateCcw, UploadCloud, ArrowRight } from 'lucide-react';

export default function SelfieStep() {
  const { session } = useAuth();
  const [appId, setAppId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Camera & Image Capture states
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [cameraSupported, setCameraSupported] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.replace('/login');
      return;
    }
    const fetchApp = async () => {
      try {
        const response = await axios.post('/api/v1/applications');
        setAppId(response.data.applicationId);
      } catch (e) {
        setError('Failed to load application coordinates.');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [session, router]);

  // Open Video Stream
  const startCamera = async () => {
    setError(null);
    setCapturedBlob(null);
    setCapturedUrl(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      setCameraSupported(true);
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setError(`Camera Access Denied/Unsupported: ${err.message || err.name || String(err)}. Please grant permissions in your browser bar.`);
      setCameraSupported(false);
    }
  };

  // Bind Stream to Video Element when ready
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((e) => console.error("Video playback failed:", e));
    }
  }, [stream]);

  // Close Video Stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (appId && cameraSupported && !capturedUrl && !stream) {
      startCamera();
    }
    return () => stopCamera();
  }, [appId, cameraSupported, capturedUrl, stream]);

  // Capture Photo Snapshot
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        // Flip image horizontally for natural mirroring
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            setCapturedBlob(blob);
            const url = URL.createObjectURL(blob);
            setCapturedUrl(url);
            stopCamera();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  // Discard Captured Photo and Retake
  const handleRetake = () => {
    setCapturedBlob(null);
    setCapturedUrl(null);
    startCamera();
  };

  // File Upload Fallback
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setCapturedBlob(selectedFile);
      setCapturedUrl(URL.createObjectURL(selectedFile));
      stopCamera();
    }
  };

  // Submit Selfie to Backend
  const handleSubmit = async () => {
    if (!capturedBlob) {
      setError('Please capture or select a selfie image first.');
      return;
    }
    setError(null);
    setSubmitting(true);

    const formData = new FormData();
    // Use matching key "selfie" from Spring Boot API DTO
    formData.append('selfie', capturedBlob, capturedBlob instanceof File ? (capturedBlob as File).name : 'selfie.jpg');

    try {
      await axios.post(`/api/v1/selfie/${appId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      router.push('/apply/success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Biometric upload failed. Ensure image quality meets criteria.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-500">Retrieving application status...</span>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 py-6">
      {/* Visual Stepper */}
      <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-full px-6 py-3">
        <span className="text-slate-400">1. KYC Details</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-slate-400">2. Terms Selected</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-slate-400">3. Bank coordinates</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-slate-400">4. Sign Declarations</span>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-white font-bold">5. Selfie Check</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Identity Selfie Check</h2>
          <p className="text-slate-400 text-xs mt-1">Capture a facial portrait photo to complete verification.</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Camera Display panel */}
        <div className="bg-slate-955 rounded-2xl overflow-hidden border border-slate-850 h-[300px] flex items-center justify-center relative">
          {capturedUrl ? (
            <img src={capturedUrl} alt="Captured portrait" className="w-full h-full object-cover" />
          ) : cameraSupported ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
          ) : (
            <div className="text-center p-6 space-y-3">
              <FileImage className="h-10 w-10 text-slate-600 mx-auto" />
              <h4 className="text-xs font-semibold text-slate-400">Camera Access Denied or Unsupported</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs">
                Please grant camera permissions or use the button below to upload a portrait image from your gallery.
              </p>
            </div>
          )}

          {/* Canvas placeholder */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Buttons Panel */}
        <div className="flex justify-center gap-4">
          {!capturedUrl && cameraSupported && (
            <button
              onClick={capturePhoto}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="h-4 w-4" />
              <span>Capture Photo</span>
            </button>
          )}

          {capturedUrl && (
            <button
              onClick={handleRetake}
              className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retake Photo</span>
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg"
            className="hidden"
          />

          {(!cameraSupported || !capturedUrl) && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Photo</span>
            </button>
          )}

          {!cameraSupported && !capturedUrl && (
            <button
              onClick={() => {
                setCameraSupported(true);
                setTimeout(() => startCamera(), 100);
              }}
              className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="h-4 w-4" />
              <span>Retry Camera</span>
            </button>
          )}
        </div>

        <hr className="border-slate-850" />

        {/* Stepper Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={submitting || !capturedBlob}
            className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            <span>Submit Verification</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
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
