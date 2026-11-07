import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface AdminLoginProps {
  onLoginSuccess: (username: string) => void;
  logoUrl?: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, logoUrl }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('srphotography2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('sr_admin_auth', JSON.stringify({ isAuthenticated: true, username: data.username }));
        onLoginSuccess(data.username);
      } else {
        setErrorMessage(data.message || 'Invalid admin credentials');
      }
    } catch {
      // Local fallback
      if (username.trim().toLowerCase() === 'admin' && password === 'srphotography2026') {
        localStorage.setItem('sr_admin_auth', JSON.stringify({ isAuthenticated: true, username: 'admin' }));
        onLoginSuccess('admin');
      } else {
        setErrorMessage('Failed to connect to authentication service.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-stone-100 p-4 relative overflow-hidden">
      {/* Decorative luxury background shapes */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-amber-50/80 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-stone-200/90 rounded-2xl shadow-xl shadow-stone-200/50 p-8 relative z-10">
        {/* Gold Accent Top Stripe */}
        <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 rounded-t-full" />

        <div className="flex flex-col items-center text-center mb-8 pt-2">
          <BrandLogo logoUrl={logoUrl} size="lg" className="mb-4" />
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">Admin Portal Access</h1>
          <p className="text-xs text-stone-500 mt-1 max-w-xs">
            Restricted business management and quotation generation console for SR PHOTOGRAPHY
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white font-semibold text-sm rounded-lg shadow-md shadow-amber-500/20 hover:from-amber-700 hover:to-amber-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Enter Admin Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Informative quick access note */}
        <div className="mt-6 pt-5 border-t border-stone-100 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50/80 border border-amber-200/60 rounded-md text-[11px] text-amber-900">
            <span>Pre-configured credentials:</span>
            <code className="font-mono font-semibold">admin</code>
            <span>/</span>
            <code className="font-mono font-semibold">srphotography2026</code>
          </div>
          <p className="text-[10px] text-stone-400 mt-2">
            Credentials can be updated anytime inside Studio Settings.
          </p>
        </div>
      </div>
    </div>
  );
};
