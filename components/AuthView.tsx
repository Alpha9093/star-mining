
import React, { useState } from 'react';
import { 
  auth, 
  googleProvider,
  appleProvider,
  signInWithPopup
} from '../firebase';

interface AuthViewProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState<string | null>(null); // 'google', 'apple', or null
  const [error, setError] = useState<string | null>(null);

  const handleSocialSignIn = async (providerType: 'google' | 'apple') => {
    setLoading(providerType);
    setError(null);
    try {
      const provider = providerType === 'google' ? googleProvider : appleProvider;
      await signInWithPopup(auth, provider);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Connection was closed.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError(`${providerType.charAt(0).toUpperCase() + providerType.slice(1)} auth is not enabled.`);
      } else {
        setError('Authentication failed. Try again.');
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-1000">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Icon Portal */}
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-1000"></div>
        <div className="relative w-24 h-24 bg-[#0a0a0a] border border-yellow-500/30 rounded-[2.5rem] flex items-center justify-center shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 to-transparent"></div>
            <span className="text-5xl drop-shadow-2xl animate-pulse">⭐</span>
        </div>
      </div>
      
      {/* Header Text */}
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl font-black text-white tracking-tighter">Secure Your Vault</h2>
        <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] font-black">
          Global Star Synchronization
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-sm bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/5 p-8 rounded-[3.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Subtle Shine Effect */}
        <div className="absolute -top-[150%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/[0.03] to-transparent rotate-45 pointer-events-none"></div>
        
        <div className="space-y-4 relative z-10">
          {/* Google Button */}
          <button 
            onClick={() => handleSocialSignIn('google')}
            disabled={!!loading}
            className="w-full h-16 bg-white text-black font-extrabold text-[11px] uppercase tracking-[0.15em] rounded-2xl flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-[0_10px_20px_-5px_rgba(255,255,255,0.1)] hover:shadow-white/20 disabled:opacity-50"
          >
            {loading === 'google' ? (
               <div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Apple Button */}
          <button 
            onClick={() => handleSocialSignIn('apple')}
            disabled={!!loading}
            className="w-full h-16 bg-black text-white border border-white/10 font-extrabold text-[11px] uppercase tracking-[0.15em] rounded-2xl flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-xl hover:bg-[#0f0f0f] disabled:opacity-50"
          >
            {loading === 'apple' ? (
               <div className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05 1.78-3.1 1.76-1.03-.02-1.36-.63-2.58-.63-1.21 0-1.58.61-2.56.65-1.03.04-2.15-.86-3.14-1.81-2.02-1.95-3.55-5.5-3.55-8.84 0-5.26 3.42-8.04 6.64-8.04 1.7 0 3.31 1.19 4.36 1.19 1.05 0 2.97-1.43 5-1.19.86.03 3.26.31 4.8 2.56-4.04 2.37-3.38 8.01.66 9.64-1.02 2.56-2.5 5.09-3.73 6.27zm-3.1-16.7c.91-1.1 1.52-2.63 1.35-4.15-1.31.05-2.9.87-3.84 1.98-.85.98-1.59 2.56-1.39 4.02 1.45.11 2.97-.75 3.88-1.85z" />
              </svg>
            )}
            Continue with Apple
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl animate-in zoom-in duration-300">
              <p className="text-red-500 text-[9px] font-bold text-center uppercase tracking-widest leading-relaxed">
                {error}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 flex flex-col items-center gap-6">
        <button 
            onClick={onCancel}
            disabled={!!loading}
            className="group flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] transition-all hover:text-white"
        >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">✨</span>
            Continue as Guest
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">✨</span>
        </button>

        <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity duration-500">
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.3em]">
                Secure Protocol Active
            </p>
            <div className="flex gap-2">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse [animation-delay:200ms]"></div>
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse [animation-delay:400ms]"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
