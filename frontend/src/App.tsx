import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Set up Axios default configurations
axios.defaults.baseURL = window.location.origin;

// Type definitions
interface UserSession {
  token: String;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  userId: number;
}

// Custom hook to manage auth state
function useAuth() {
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('ezfinanz_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.token) {
          // Set authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse user session', e);
      }
    }
    return null;
  });

  const login = (data: UserSession) => {
    localStorage.setItem('ezfinanz_session', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setSession(data);
  };

  const logout = () => {
    localStorage.removeItem('ezfinanz_session');
    delete axios.defaults.headers.common['Authorization'];
    setSession(null);
  };

  return { session, login, logout };
}

// Layout wrapper
interface LayoutProps {
  children: React.ReactNode;
  session: UserSession | null;
  logout: () => void;
}

function Layout({ children, session, logout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              EZ
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              EZFINANZ
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-medium text-slate-300">{session.email}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">
                    {session.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm font-semibold text-slate-400 hover:text-white transition duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition duration-200">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition duration-200 shadow-md shadow-indigo-600/10"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <div>© {new Date().getFullYear()} EZFINANZ Inc. All rights reserved.</div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="hover:text-slate-300 cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer transition">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer transition">Security Compliance</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Protected Route Guard
interface GuardProps {
  session: UserSession | null;
  allowedRole?: 'CUSTOMER' | 'ADMIN';
  children: React.ReactElement;
}

function RouteGuard({ session, allowedRole, children }: GuardProps) {
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && session.role !== allowedRole) {
    return <Navigate to={session.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}

// Register Component
function Register({ session, onRegister }: { session: UserSession | null; onRegister: (data: UserSession) => void }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (session) {
    return <Navigate to={session.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await axios.post('/api/v1/auth/register', { email, password, phone });
      onRegister(response.data);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response && err.response.data) {
        if (err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setFieldErrors(err.response.data);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
        <p className="text-slate-400 text-sm mt-2">Begin your digital personal loan journey</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-sm flex items-start space-x-2">
          <svg className="h-5 w-5 shrink-0 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
            placeholder="name@example.com"
          />
          {fieldErrors.email && <p className="text-rose-400 text-xs mt-1">{fieldErrors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Phone Number</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
            placeholder="e.g. 9876543210"
          />
          {fieldErrors.phone && <p className="text-rose-400 text-xs mt-1">{fieldErrors.phone}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
            placeholder="••••••••"
          />
          {fieldErrors.password && <p className="text-rose-400 text-xs mt-1">{fieldErrors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition duration-200 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating account...</span>
            </>
          ) : (
            <span>Register</span>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition">
          Sign In
        </Link>
      </div>
    </div>
  );
}

// Login Component
function Login({ session, onLogin }: { session: UserSession | null; onLogin: (data: UserSession) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (session) {
    return <Navigate to={session.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await axios.post('/api/v1/auth/login', { email, password });
      onLogin(response.data);
      navigate(response.data.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      if (err.response && err.response.data) {
        if (err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setFieldErrors(err.response.data);
        }
      } else {
        setError('Invalid credentials or server is unreachable.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
        <p className="text-slate-400 text-sm mt-2">Log in to manage your loan application</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-sm flex items-start space-x-2">
          <svg className="h-5 w-5 shrink-0 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
            placeholder="name@example.com"
          />
          {fieldErrors.email && <p className="text-rose-400 text-xs mt-1">{fieldErrors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
            placeholder="••••••••"
          />
          {fieldErrors.password && <p className="text-rose-400 text-xs mt-1">{fieldErrors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition duration-200 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition">
          Sign Up
        </Link>
      </div>
    </div>
  );
}

// Customer Dashboard
function CustomerDashboard({ session }: { session: UserSession }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Intro Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Hello, Customer</h1>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            Welcome to your EZFINANZ portal. Here you can apply for a personal loan, upload your verification documents, and track your application status.
          </p>
        </div>
      </div>

      {/* Main Flow Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6">Your Personal Loan Journey</h3>

        {/* Journey Progress (Phase 1 Stub) */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h4 className="font-semibold text-white">Digital Onboarding</h4>
            <p className="text-xs text-slate-500 mt-1">Status: Registered successfully</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded border border-indigo-500/20 uppercase">
              Phase 1 Complete
            </span>
            <button
              onClick={() => alert("Subsequent loan stages (OTP Verification, KYC) will be available in Phase 2.")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg transition duration-200 shadow-md shadow-indigo-600/10"
            >
              Apply for Loan
            </button>
          </div>
        </div>

        {/* Technical Details panel */}
        <div className="mt-8 border-t border-slate-800/80 pt-6">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Debug Session Details</h4>
          <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-indigo-300 overflow-x-auto space-y-1">
            <div><span className="text-slate-500">JWT Token:</span> {session.token.substring(0, 40)}...</div>
            <div><span className="text-slate-500">Email:</span> {session.email}</div>
            <div><span className="text-slate-500">User ID:</span> {session.userId}</div>
            <div><span className="text-slate-500">Role:</span> {session.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin Dashboard
function AdminDashboard({ session }: { session: UserSession }) {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Admin Panel Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 h-40 w-40 bg-violet-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Admin Control Center ({session.email})</h1>
          <p className="text-slate-400 leading-relaxed">
            Review, verify, and approve digital loan applications. Process KYC documentation, selfie verification checks, and manage disbursements.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Pending Selfie Reviews</div>
          <div className="text-3xl font-extrabold text-white">0</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Active Applications</div>
          <div className="text-3xl font-extrabold text-white">0</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Total Disbursed</div>
          <div className="text-3xl font-extrabold text-white">₹0.00</div>
        </div>
      </div>

      {/* Phase 1 Admin Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4">Application Queue</h3>
        <p className="text-slate-400 text-sm mb-6">
          Phase 1 is configured and running. Role authentication verifies that only admins can view this page. Seeding script has pre-loaded this user account.
        </p>

        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-950">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Applicant</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Stage</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/50 divide-y divide-slate-800">
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500">
                  No active loan applications in queue. Customer flow will populate this list in future phases.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const { session, login, logout } = useAuth();

  return (
    <BrowserRouter>
      <Layout session={session} logout={logout}>
        <Routes>
          <Route path="/register" element={<Register session={session} onRegister={login} />} />
          <Route path="/login" element={<Login session={session} onLogin={login} />} />
          
          <Route
            path="/dashboard"
            element={
              <RouteGuard session={session} allowedRole="CUSTOMER">
                <CustomerDashboard session={session!} />
              </RouteGuard>
            }
          />
          
          <Route
            path="/admin"
            element={
              <RouteGuard session={session} allowedRole="ADMIN">
                <AdminDashboard session={session!} />
              </RouteGuard>
            }
          />

          <Route
            path="/"
            element={
              session ? (
                <Navigate to={session.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
