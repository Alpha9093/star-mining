
import React, { useState } from 'react';
import { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification 
} from '../firebase';

interface AuthViewProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onSuccess, onCancel }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        onSuccess();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setMessage("Account created! Check your email for a verification link.");
        // We don't call onSuccess immediately to let them read the message
        setTimeout(onSuccess, 3000);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('This email is already registered.');
      else if (err.code === 'auth/wrong-password') setError('Incorrect password.');
      else if (err.code === 'auth/user-not-found') setError('No account found with this email.');
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">🔐</span>
      </div>
      
      <h2 className="text-2xl font-black text-white mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
      <p className="text-gray-500 text-xs mb-8 uppercase tracking-widest font-bold">Secure your mined stars</p>

      <div className="w-full bg-gray-900 border border-gray-800 p-6 rounded-[32px] mb-6">
        <div className="flex bg-black p-1 rounded-xl mb-6">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${isLogin ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${!isLogin ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-yellow-500 transition-all"
              placeholder="star@miner.com"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-1 block">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-yellow-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-[10px] font-bold text-center animate-pulse">{error}</p>}
          {message && <p className="text-green-500 text-[10px] font-bold text-center">{message}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-xl disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>

      <button 
        onClick={onCancel}
        className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
      >
        Continue as Guest
      </button>
    </div>
  );
};

export default AuthView;
