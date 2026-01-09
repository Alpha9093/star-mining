
import React, { useState, useEffect } from 'react';
import { Task, WithdrawalRequest } from '../types';
import { db, auth, addDoc, collection, getUserId, getDocs, query, where } from '../firebase';

interface WalletViewProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  tasks: Task[];
}

const WalletView: React.FC<WalletViewProps> = ({ balance, setBalance, tasks }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Conversion rate: 10,000 stars = 0.1$ -> 1,000,000 stars = 10$
  const STAR_TO_USD = 0.1 / 10000;
  const MIN_WITHDRAW_USD = 10;
  const MIN_WITHDRAW_STARS = MIN_WITHDRAW_USD / STAR_TO_USD; // 1,000,000

  const estimatedValue = balance * STAR_TO_USD;
  const userId = getUserId();
  const currentUser = auth.currentUser;

  // Load history
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const q = query(collection(db, "withdrawals"), where("userId", "==", userId));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as WithdrawalRequest));
        setHistory(data.sort((a, b) => b.timestamp - a.timestamp));
      } catch (e) {
        console.warn("Could not fetch history.");
      }
      setIsLoadingHistory(false);
    };
    fetchHistory();
  }, [userId]);

  const handleConfirmWallet = () => {
    if (walletAddress.trim().length > 20) {
      setIsConnected(true);
      setIsConnecting(false);
    } else {
      alert("Please enter a valid TON wallet address.");
    }
  };

  const handleWithdrawRequest = async () => {
    const amountToWithdraw = Math.floor(balance);
    
    if (amountToWithdraw < MIN_WITHDRAW_STARS) {
      alert(`Minimum withdrawal is $${MIN_WITHDRAW_USD} (${MIN_WITHDRAW_STARS.toLocaleString()} Stars)`);
      return;
    }
    
    setIsRequesting(true);
    try {
      const newRequest: any = {
        userId: userId,
        address: walletAddress,
        amount: amountToWithdraw,
        amountUsd: Number((amountToWithdraw * STAR_TO_USD).toFixed(2)),
        status: 'pending',
        timestamp: Date.now()
      };
      
      const docRef = await addDoc(collection(db, "withdrawals"), newRequest);
      
      // Deduct the withdrawn amount from local state. 
      // App.tsx sync logic will automatically save this 0 (or remainder) to Firestore.
      setBalance(prev => prev - amountToWithdraw);
      
      setHistory(prev => [{ id: docRef.id, ...newRequest }, ...prev]);
      
      alert("Withdrawal request sent! Stars deducted from your balance. Admin will process it soon.");
    } catch (e) {
      alert("Error sending request.");
    }
    setIsRequesting(false);
  };

  const formatAddress = (addr: string) => {
    if (addr.length < 10) return addr;
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 8)}`;
  };

  return (
    <div className="py-4 flex flex-col items-center">
      <div className="w-20 h-20 bg-purple-500/20 rounded-3xl flex items-center justify-center mb-6 rotate-3 border-2 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
        <span className="text-4xl">💼</span>
      </div>
      
      <h2 className="text-2xl font-black text-white mb-2 text-center leading-tight">Star Wallet</h2>
      
      {/* Account Security Banner */}
      {!currentUser ? (
        <div className="w-full bg-blue-600/10 border border-blue-500/30 p-3 rounded-2xl mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Guest Session</p>
            <p className="text-[9px] text-gray-500">Sign in to sync multiple devices</p>
          </div>
          <span className="text-xl">⚠️</span>
        </div>
      ) : (
        <div className="w-full bg-green-500/10 border border-green-500/30 p-3 rounded-2xl mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Verified Account</p>
            <p className="text-[9px] text-gray-500 truncate max-w-[150px]">{currentUser.email}</p>
          </div>
          <span className="text-xl">✅</span>
        </div>
      )}

      {/* Main Balance Card */}
      <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-[32px] p-6 mb-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <p className="text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Available for Payout</p>
        <div className="flex items-center space-x-2 mb-1">
            <span className="text-4xl font-black text-yellow-400">${estimatedValue.toFixed(4)}</span>
        </div>
        
        <div className="mt-8 flex items-end justify-between border-t border-gray-800 pt-4">
          <div>
            <p className="text-[10px] font-black text-gray-500 mb-1 uppercase tracking-widest">Mining Balance</p>
            <p className="text-2xl font-black text-white">{Math.floor(balance).toLocaleString()} <span className="text-yellow-500 text-xs">✨</span></p>
          </div>
          <div className="text-right">
             <p className="text-[8px] text-gray-600 font-bold uppercase">Min. Withdraw: $10.00</p>
          </div>
        </div>

        {isConnected && (
          <div className="mt-6 space-y-3">
             {balance >= MIN_WITHDRAW_STARS ? (
                <button 
                  disabled={isRequesting}
                  onClick={handleWithdrawRequest}
                  className="w-full py-4 bg-yellow-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-xl shadow-yellow-500/20"
                >
                  {isRequesting ? 'Processing Request...' : 'Withdraw to TON'}
                </button>
             ) : (
                <div className="w-full py-4 bg-gray-800/50 border border-gray-700 text-gray-500 font-black text-[10px] uppercase tracking-widest rounded-2xl text-center">
                   Need ${(10 - estimatedValue).toFixed(2)} more to withdraw
                </div>
             )}
          </div>
        )}
      </div>

      {/* History Section */}
      <div className="w-full mb-8">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Withdrawal Activity</h3>
        
        {isLoadingHistory ? (
          <div className="py-6 text-center text-gray-600 animate-pulse text-[10px] font-black uppercase">Syncing Logs...</div>
        ) : history.length === 0 ? (
          <div className="bg-gray-900/20 border border-dashed border-gray-800 rounded-3xl py-8 text-center">
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">No previous requests</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {history.map(h => (
              <div key={h.id} className="bg-gray-900/40 border border-gray-800 p-3 rounded-2xl flex items-center justify-between group hover:bg-gray-900 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-black border border-gray-800 rounded-lg flex items-center justify-center text-xs">💎</div>
                  <div>
                    <p className="text-[10px] font-black text-white">${((h.amount / 10000) * 0.1).toFixed(2)}</p>
                    <p className="text-[8px] text-gray-500 uppercase font-bold">{new Date(h.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border
                  ${h.status === 'completed' 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse'}`}>
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isConnected && !isConnecting && (
        <button 
          onClick={() => setIsConnecting(true)}
          className="w-full py-5 bg-white text-black font-black text-sm uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-xl shadow-white/10"
        >
          Connect Wallet to Withdraw
        </button>
      )}

      {isConnecting && (
        <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="relative">
            <input 
              type="text"
              placeholder="Paste TON Wallet Address (EQ...)"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 px-6 text-white text-sm font-bold focus:outline-none focus:border-yellow-500 transition-all placeholder-gray-700"
            />
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleConfirmWallet}
              className="flex-[2] py-4 bg-yellow-500 text-black font-black text-xs uppercase tracking-widest rounded-xl active:scale-95 transition-all"
            >
              Verify Address
            </button>
            <button 
              onClick={() => setIsConnecting(false)}
              className="flex-1 py-4 bg-gray-900 text-gray-500 font-bold text-xs uppercase rounded-xl"
            >
              Cancel
            </button>
          </div>
          <p className="text-[9px] text-gray-500 text-center uppercase font-black tracking-widest">Ensure your address is on TON Network</p>
        </div>
      )}

      {isConnected && (
        <div className="w-full space-y-3 animate-in fade-in duration-300">
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shadow-lg shadow-blue-500/20">TON</div>
                    <span className="text-[10px] font-black text-white font-mono">{formatAddress(walletAddress)}</span>
                </div>
                <button 
                  onClick={() => {
                    if(window.confirm("Change wallet address?")) {
                      setIsConnected(false);
                      setIsConnecting(true);
                    }
                  }} 
                  className="text-[9px] font-black text-gray-500 uppercase hover:text-white transition-colors"
                >
                  Change
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default WalletView;
