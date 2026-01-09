
import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, doc, updateDoc, setDoc } from '../firebase';
import { UserProfile, WithdrawalRequest } from '../types';

const AdminView: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'users' | 'withdraws'>('stats');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Manual ban states
  const [manualId, setManualId] = useState('');
  const [isProcessingManual, setIsProcessingManual] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const usersData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile));
      setUsers(usersData);

      const withdrawSnap = await getDocs(collection(db, "withdrawals"));
      const withdrawData = withdrawSnap.docs.map(d => ({ id: d.id, ...d.data() } as WithdrawalRequest));
      setWithdrawals(withdrawData.sort((a, b) => b.timestamp - a.timestamp));
    } catch (e: any) {
      console.error("Admin fetch error:", e);
      if (e.code === 'permission-denied' || e.message?.toLowerCase().includes("permission")) {
        setError("Firebase Security Rules are blocking access. Follow the guide below to fix this.");
      } else {
        setError(e.message || "Failed to connect to database.");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const copyRules = () => {
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true;
    }
    match /users/{document=**} {
      allow list: if true;
      allow read, write: if true;
    }
    match /withdrawals/{document=**} {
      allow read, write: if true;
    }
  }
}`;
    navigator.clipboard.writeText(rules);
    alert("Rules copied! Paste them into your Firebase Console -> Firestore -> Rules tab.");
  };

  const toggleBan = async (userId: string, currentStatus: boolean) => {
    try {
      await setDoc(doc(db, "users", userId), { isBanned: !currentStatus }, { merge: true });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: !currentStatus } : u));
    } catch (e) {
      alert("Failed to update user status.");
    }
  };

  const handleManualAction = async (ban: boolean) => {
    if (!manualId.trim()) return;
    setIsProcessingManual(true);
    try {
      await setDoc(doc(db, "users", manualId.trim()), { isBanned: ban }, { merge: true });
      alert(`User ${manualId} has been ${ban ? 'BANNED' : 'UNBANNED'}.`);
      setManualId('');
      fetchData();
    } catch (e) {
      alert("Failed to perform manual action.");
    }
    setIsProcessingManual(false);
  };

  const completeWithdrawal = async (id: string) => {
    if (!window.confirm("Confirm: You have sent the TON to this user? This will mark the request as COMPLETED.")) return;
    try {
      await updateDoc(doc(db, "withdrawals", id), { status: 'completed' });
      
      // Update local state immediately for instant feedback
      setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'completed' } : w));
      
      alert("✅ Success! The withdrawal is now marked as completed.");
    } catch (e: any) {
      console.error("Error completing withdrawal:", e);
      alert("Failed to update status: " + e.message);
    }
  };

  const totalStars = users.reduce((acc, u) => acc + (u.balance || 0), 0);
  const pendingAmount = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((acc, w) => acc + (w.amount || 0), 0);
  
  const filteredUsers = users.filter(u => 
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-bold text-xs uppercase animate-pulse tracking-widest">Accessing Master Core...</p>
    </div>
  );

  if (error) return (
    <div className="py-6 px-4 animate-in fade-in duration-500">
      <div className="bg-red-500/10 border-2 border-red-500/30 rounded-[32px] p-8 text-center">
        <div className="text-6xl mb-6">🔐</div>
        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">Permission Error</h3>
        <p className="text-gray-400 text-xs leading-relaxed mb-8">
          Firestore is blocking the Admin Panel. You must update your Security Rules in the Firebase Console.
        </p>
        
        <div className="bg-black/60 rounded-2xl p-4 text-left border border-gray-800 mb-8">
          <p className="text-[10px] text-yellow-500 font-black uppercase mb-3 tracking-widest">Step-by-Step Fix:</p>
          <ol className="text-[10px] text-gray-400 space-y-2 font-medium">
            <li>1. Go to <span className="text-white">console.firebase.google.com</span></li>
            <li>2. Select <span className="text-white">Firestore Database</span></li>
            <li>3. Click the <span className="text-white">"Rules"</span> tab</li>
            <li>4. Paste the correct rules and click <span className="text-white">"Publish"</span></li>
          </ol>
        </div>

        <button 
          onClick={copyRules}
          className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl mb-4 active:scale-95 transition-all shadow-xl"
        >
          Copy Correct Rules
        </button>

        <button 
          onClick={fetchData}
          className="w-full py-4 bg-gray-900 border border-gray-800 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );

  return (
    <div className="py-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-red-500">Admin Control</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Master Dashboard</p>
        </div>
        <button onClick={fetchData} className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 active:rotate-180 transition-all duration-500">🔄</button>
      </div>

      <div className="flex bg-gray-900 p-1 rounded-2xl mb-6 border border-gray-800/50">
        {(['stats', 'users', 'withdraws'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all
              ${activeSubTab === tab ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-gray-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeSubTab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-3xl">
              <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Total Players</p>
              <p className="text-2xl font-black text-white">{users.length.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-3xl">
              <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Total Earnings</p>
              <p className="text-2xl font-black text-yellow-500">{(totalStars / 1000).toFixed(1)}k ✨</p>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Payout Pipeline</h3>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-[9px] text-yellow-500 font-bold uppercase">Pending Amount</p>
                <p className="text-2xl font-black text-white">${((pendingAmount / 10000) * 0.1).toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-gray-500 font-bold uppercase">Queued Requests</p>
                <p className="text-2xl font-black text-white">{withdrawals.filter(w => w.status === 'pending').length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-red-600/5 border border-red-500/20 p-4 rounded-3xl mb-4">
            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3">Manual Override (Ban by ID)</h3>
            <div className="flex flex-col space-y-2">
              <input 
                type="text"
                placeholder="Enter exact User ID..."
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-red-500"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => handleManualAction(true)}
                  disabled={isProcessingManual}
                  className="flex-1 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-xl disabled:opacity-50"
                >
                  Ban ID
                </button>
                <button 
                  onClick={() => handleManualAction(false)}
                  disabled={isProcessingManual}
                  className="flex-1 py-2.5 bg-gray-800 text-white text-[10px] font-black uppercase rounded-xl disabled:opacity-50"
                >
                  Unban ID
                </button>
              </div>
            </div>
          </div>

          <div className="relative">
            <input 
              type="text"
              placeholder="Search User ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-red-500 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600">🔍</span>
          </div>
          
          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
            {filteredUsers.map(user => (
              <div key={user.id} className="bg-gray-900/60 border border-gray-800 p-3 rounded-2xl flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-gray-500 truncate mb-1 font-mono">{user.id}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{Math.floor(user.balance).toLocaleString()} ✨</span>
                    {user.isBanned && <span className="text-[8px] bg-red-600/20 text-red-500 px-1.5 py-0.5 rounded-lg font-black uppercase">Banned</span>}
                  </div>
                </div>
                <button 
                  onClick={() => toggleBan(user.id, !!user.isBanned)}
                  className={`ml-4 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${user.isBanned ? 'bg-green-600 text-white' : 'bg-red-900/20 text-red-500 border border-red-500/30'}`}
                >
                  {user.isBanned ? 'Unban' : 'Ban'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'withdraws' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Withdrawal Log</h3>
            <span className="text-[10px] text-gray-700 font-bold">{withdrawals.length} Total</span>
          </div>
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {withdrawals.map(req => (
              <div key={req.id} className={`bg-gray-900 border ${req.status === 'completed' ? 'border-gray-800 opacity-60' : 'border-red-500/20'} p-4 rounded-3xl transition-all`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Payout Value</span>
                    <span className="text-lg font-black text-yellow-500">
                      ${req.amountUsd ? req.amountUsd.toFixed(2) : ((req.amount / 10000) * 0.1).toFixed(2)}
                    </span>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full border flex items-center gap-1
                    ${req.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse'}`}>
                    {req.status === 'completed' && <span>✅</span>}
                    {req.status}
                  </span>
                </div>
                
                <div className="bg-black/40 p-3 rounded-2xl border border-gray-800 mb-1 flex items-center justify-between" onClick={() => {navigator.clipboard.writeText(req.id); alert("User ID copied!");}}>
                  <div>
                    <p className="text-[8px] text-gray-600 uppercase font-black mb-1">User Reference</p>
                    <p className="text-[9px] text-gray-400 font-mono truncate max-w-[150px]">{req.userId}</p>
                  </div>
                  <span className="text-[8px] text-gray-700">📋</span>
                </div>

                <div className="bg-black/40 p-3 rounded-2xl border border-gray-800 mb-3" onClick={() => {navigator.clipboard.writeText(req.address); alert("Wallet address copied!");}}>
                  <p className="text-[8px] text-gray-600 uppercase font-black mb-1">TON Wallet Address</p>
                  <p className="text-[10px] text-gray-300 font-mono break-all leading-tight">{req.address}</p>
                </div>

                {req.status === 'pending' && (
                  <button onClick={() => completeWithdrawal(req.id)} className="w-full py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-xl shadow-red-600/20">
                    Confirm & Mark Payout Completed
                  </button>
                )}
                
                {req.status === 'completed' && (
                  <div className="w-full py-3 bg-gray-800/50 text-gray-600 text-[9px] font-black uppercase tracking-widest rounded-2xl text-center border border-gray-700/50">
                    Payout Finalized
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
