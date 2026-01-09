
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tab, GameState, Boost, Task } from './types';
import MiningView from './components/MiningView';
import BoostView from './components/BoostView';
import TaskView from './components/TaskView';
import FriendsView from './components/FriendsView';
import WalletView from './components/WalletView';
import AdminView from './components/AdminView';
import AuthView from './components/AuthView';
import Navigation from './components/Navigation';
import { db, auth, getUserId, doc, setDoc, getDoc, onSnapshot, onAuthStateChanged, signOut } from './firebase';

const LOCAL_STORAGE_KEY = 'star_mining_local_save';

const INITIAL_BOOSTS: Boost[] = [
  { id: 'multitap', name: 'Multitap', description: 'Increase stars per tap', baseCost: 100, multiplier: 2, level: 1, icon: '👆' },
  { id: 'limit', name: 'Energy Limit', description: 'Increase max energy', baseCost: 100, multiplier: 1.5, level: 1, icon: '⚡' },
  { id: 'recharge', name: 'Recharge Speed', description: 'Faster energy recovery', baseCost: 250, multiplier: 2.5, level: 1, icon: '🔋' },
  { id: 'robot', name: 'Mining Robot', description: 'Passive star collection', baseCost: 1000, multiplier: 3, level: 0, icon: '🤖' }
];

const TASK_LINK = "https://otieu.com/4/10183879";

const INITIAL_TASKS: Task[] = [
  { id: 'task_1', title: 'Join Star Community', reward: 50, icon: '🌟', link: TASK_LINK, completed: false },
  { id: 'task_2', title: 'Follow Main Channel', reward: 75, icon: '📢', link: TASK_LINK, completed: false },
  { id: 'task_3', title: 'Watch Promo Video', reward: 90, icon: '🎬', link: TASK_LINK, completed: false },
  { id: 'task_4', title: 'Verify Partner Task', reward: 95, icon: '🤝', link: TASK_LINK, completed: false }
];

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudEnabled, setCloudEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('mine');
  const [balance, setBalance] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(1000);
  const [maxEnergy, setMaxEnergy] = useState<number>(1000);
  const [rechargeRate, setRechargeRate] = useState<number>(1);
  const [multitap, setMultitap] = useState<number>(1);
  const [autoMiningRate, setAutoMiningRate] = useState<number>(0);
  const [boosts, setBoosts] = useState<Boost[]>(INITIAL_BOOSTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const lastUpdateRef = useRef<number>(Date.now());
  const userId = getUserId();

  // Handle Auth State Changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadDataManual(user.uid);
      }
    });
    return unsub;
  }, []);

  const loadDataManual = async (specificUid?: string) => {
    const targetUid = specificUid || userId;
    const localSaved = localStorage.getItem(LOCAL_STORAGE_KEY);
    let initialData = localSaved ? JSON.parse(localSaved) : null;

    if (initialData) {
      applyState(initialData);
    }

    try {
      const userDoc = await getDoc(doc(db, "users", targetUid));
      if (userDoc.exists()) {
        const cloudData = userDoc.data();
        if (!initialData || (cloudData.lastUpdate > initialData.lastUpdate)) {
          applyState(cloudData);
        }
      }
      setCloudEnabled(true);
    } catch (e: any) {
      console.warn("Cloud load failed", e);
      setCloudEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const applyState = (data: any) => {
    setBalance(data.balance || 0);
    setEnergy(data.energy || 1000);
    setBoosts(data.boosts || INITIAL_BOOSTS);
    setIsBanned(!!data.isBanned);
    setIsAdmin(!!data.isAdmin);
    const loadedTasks = data.tasks || INITIAL_TASKS;
    setTasks(INITIAL_TASKS.map(it => {
      const saved = loadedTasks.find((lt: any) => lt.id === it.id);
      return saved ? { ...it, completed: saved.completed } : it;
    }));
    
    const mLevel = data.boosts?.find((b: Boost) => b.id === 'multitap')?.level || 1;
    const eLevel = data.boosts?.find((b: Boost) => b.id === 'limit')?.level || 1;
    const rLevel = data.boosts?.find((b: Boost) => b.id === 'recharge')?.level || 1;
    const robotLevel = data.boosts?.find((b: Boost) => b.id === 'robot')?.level || 0;

    setMultitap(mLevel);
    setMaxEnergy(1000 + (eLevel - 1) * 500);
    setRechargeRate(1 + (rLevel - 1) * 0.5);
    setAutoMiningRate(robotLevel * 2);
  };

  // Load Initial Data & Start Real-time listener for Ban/Admin status
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "users", userId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setIsBanned(!!data.isBanned);
        setIsAdmin(!!data.isAdmin);
        if (isLoading) {
          applyState(data);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }, (error) => {
      loadDataManual();
    });

    return () => unsub();
  }, [userId, isLoading]);

  // Sync to Cloud
  useEffect(() => {
    if (isLoading || isBanned) return;

    const saveData = async () => {
      const stateToSave = {
        balance,
        energy,
        boosts,
        tasks,
        isBanned,
        isAdmin, // Keep existing admin status in sync
        lastUpdate: Date.now()
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));

      if (cloudEnabled) {
        setIsSyncing(true);
        try {
          await setDoc(doc(db, "users", userId), stateToSave, { merge: true });
        } catch (e) {
          setCloudEnabled(false);
        } finally {
          setTimeout(() => setIsSyncing(false), 500);
        }
      }
    };

    const timeout = setTimeout(saveData, 3000);
    return () => clearTimeout(timeout);
  }, [balance, energy, boosts, tasks, userId, isLoading, cloudEnabled, isBanned, isAdmin]);

  // Core Game Loop
  useEffect(() => {
    if (isLoading || isBanned) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;
      setEnergy(prev => Math.min(maxEnergy, prev + rechargeRate * delta));
      if (autoMiningRate > 0) {
        setBalance(prev => prev + autoMiningRate * delta);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [maxEnergy, rechargeRate, autoMiningRate, isLoading, isBanned]);

  const handleTap = useCallback((x: number, y: number) => {
    if (isBanned) return false;
    if (energy >= multitap) {
      setBalance(prev => prev + multitap);
      setEnergy(prev => Math.max(0, prev - multitap));
      return true;
    }
    return false;
  }, [energy, multitap, isBanned]);

  const upgradeBoost = (id: string) => {
    if (isBanned) return;
    const boostIndex = boosts.findIndex(b => b.id === id);
    if (boostIndex === -1) return;
    const boost = boosts[boostIndex];
    const cost = Math.floor(boost.baseCost * Math.pow(boost.multiplier, boost.level));

    if (balance >= cost) {
      setBalance(prev => prev - cost);
      const newBoosts = [...boosts];
      newBoosts[boostIndex].level += 1;
      setBoosts(newBoosts);

      if (id === 'multitap') setMultitap(newBoosts[boostIndex].level);
      if (id === 'limit') setMaxEnergy(1000 + (newBoosts[boostIndex].level - 1) * 500);
      if (id === 'recharge') setRechargeRate(1 + (newBoosts[boostIndex].level - 1) * 0.5);
      if (id === 'robot') setAutoMiningRate(newBoosts[boostIndex].level * 2);
    }
  };

  const completeTask = (id: string) => {
    if (isBanned) return;
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1 || tasks[taskIndex].completed || verifyingTaskId) return;
    window.open(tasks[taskIndex].link, '_blank');
    setVerifyingTaskId(id);
    setTimeout(() => {
        const newTasks = [...tasks];
        const currentTask = newTasks.find(t => t.id === id);
        if (currentTask) {
          currentTask.completed = true;
          setTasks(newTasks);
          setBalance(prev => prev + currentTask.reward);
        }
        setVerifyingTaskId(null);
    }, 3000);
  };

  const handleLogout = async () => {
    if (window.confirm("Logout? Make sure you registered an email to keep your progress.")) {
      await signOut(auth);
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-black">
        <div className="text-6xl mb-4 animate-bounce">⭐</div>
        <h1 className="text-2xl font-black text-yellow-400">StarMining</h1>
        <p className="text-gray-500 text-sm mt-4 animate-pulse uppercase tracking-widest">Waking up robots...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-black select-none">
      {/* Banned Overlay */}
      {isBanned && (
        <div className="absolute inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="text-7xl mb-6">🚫</div>
          <h2 className="text-2xl font-black text-red-500 mb-4 uppercase tracking-tighter">Access Denied</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Your account has been restricted for violating terms of service.
          </p>
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl w-full text-xs text-red-400 font-bold font-mono">
            REF: {userId}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pt-6 pb-2 px-6 flex justify-between items-center z-10">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">✨</span>
            <span className="text-2xl font-black text-yellow-400">
              {Math.floor(balance).toLocaleString()}
            </span>
            {isSyncing && <span className="ml-1 text-blue-400 text-[10px] animate-pulse">☁️</span>}
          </div>
          {currentUser && (
            <span className="text-[8px] text-gray-500 font-bold truncate max-w-[120px]">
              {currentUser.email}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
           {!currentUser ? (
             <button 
              onClick={() => setShowAuth(true)}
              className="text-[9px] font-black text-white bg-blue-600 px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-blue-600/20"
             >
              Login
             </button>
           ) : (
             <button 
              onClick={handleLogout}
              className="text-[9px] font-black text-gray-400 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg uppercase tracking-widest"
             >
              Exit
             </button>
           )}
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-gray-900/50 px-2.5 py-1.5 rounded-lg">
            {isBanned ? <span className="text-red-500">BAN</span> : `Lvl ${Math.floor(Math.log10(balance + 1)) + 1}`}
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-24 px-4">
        {showAuth ? (
          <AuthView onSuccess={() => setShowAuth(false)} onCancel={() => setShowAuth(false)} />
        ) : (
          (() => {
            switch (activeTab) {
              case 'mine': return <MiningView balance={balance} energy={energy} maxEnergy={maxEnergy} onTap={handleTap} />;
              case 'boost': return <BoostView balance={balance} boosts={boosts} onUpgrade={upgradeBoost} />;
              case 'tasks': return <TaskView tasks={tasks} onComplete={completeTask} verifyingTaskId={verifyingTaskId} />;
              case 'friends': return <FriendsView balance={balance} />;
              case 'wallet': return <WalletView balance={balance} setBalance={setBalance} tasks={tasks} />;
              case 'admin': 
                return isAdmin ? <AdminView /> : <MiningView balance={balance} energy={energy} maxEnergy={maxEnergy} onTap={handleTap} />;
              default: return <MiningView balance={balance} energy={energy} maxEnergy={maxEnergy} onTap={handleTap} />;
            }
          })()
        )}
      </main>

      {!showAuth && <Navigation activeTab={activeTab} onTabChange={setActiveTab} isAdmin={isAdmin} />}
    </div>
  );
};

export default App;
