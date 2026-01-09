
import React, { useState, useEffect } from 'react';
import { Task } from '../types';

interface TaskViewProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onRefresh: () => void;
  verifyingTaskId: string | null;
}

const TaskView: React.FC<TaskViewProps> = ({ tasks, onComplete, onRefresh, verifyingTaskId }) => {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let timer: any;
    if (verifyingTaskId) {
      setSecondsLeft(5);
      timer = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setSecondsLeft(0);
    }
    return () => clearInterval(timer);
  }, [verifyingTaskId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Visual feedback for continuous refresh
    setTimeout(() => {
      onRefresh();
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="py-4 relative animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8 px-1">
        <div>
          <h2 className="text-2xl font-black text-yellow-400 uppercase tracking-tighter flex items-center gap-3">
            <span className="text-3xl">🎯</span> Daily Missions
          </h2>
          <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.25em] mt-1">Generate unlimited star rewards</p>
        </div>
      </div>

      {/* Verification Modal Popup */}
      {verifyingTaskId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl"></div>
          <div className="relative bg-[#0a0a0a] border border-yellow-500/20 p-10 rounded-[4rem] w-full max-w-xs text-center shadow-[0_0_80px_rgba(234,179,8,0.1)]">
            <div className="relative w-24 h-24 mx-auto mb-8">
               <svg className="w-full h-full transform -rotate-90">
                  <circle
                    className="text-gray-900"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="48"
                    cy="48"
                  />
                  <circle
                    className="text-yellow-500 countdown-ring"
                    strokeWidth="8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="48"
                    cy="48"
                  />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-white">
                 {secondsLeft}s
               </div>
            </div>
            
            <h3 className="text-xl font-black text-white mb-2 tracking-tight uppercase">Verifying Visit</h3>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
              Redirecting to Sponsor... <br/>
              Don't close the window!
            </p>
            
            <div className="mt-8 flex justify-center gap-2">
               <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:200ms]"></div>
               <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce [animation-delay:400ms]"></div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {tasks.map((task) => {
          const isVerifying = verifyingTaskId === task.id;
          
          return (
            <div 
              key={task.id}
              className={`bg-gray-900/40 backdrop-blur-md border ${task.completed ? 'border-green-500/20 opacity-40' : isVerifying ? 'border-yellow-500/50 scale-[0.98]' : 'border-gray-800/60'} rounded-[2.5rem] p-5 flex items-center justify-between transition-all duration-300`}
            >
              <div className="flex items-center space-x-5">
                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-2xl transition-all shadow-inner ${task.completed ? 'bg-green-900/10' : 'bg-black/40 border border-gray-800'}`}>
                  {task.completed ? '✨' : isVerifying ? '⏳' : task.icon}
                </div>
                <div>
                  <h3 className={`font-black text-[12px] uppercase tracking-wider ${task.completed ? 'text-gray-600 line-through' : 'text-white'}`}>{task.title}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                     <span className="text-[10px] text-yellow-500 font-black">+{task.reward.toLocaleString()}</span>
                     <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Stars</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => onComplete(task.id)}
                disabled={task.completed || verifyingTaskId !== null}
                className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all min-w-[100px]
                  ${task.completed 
                    ? 'bg-transparent text-green-500/30 border border-green-500/10 cursor-default' 
                    : isVerifying
                      ? 'bg-yellow-500/10 text-yellow-500 animate-pulse'
                      : 'bg-white text-black hover:bg-yellow-400 active:scale-90 shadow-2xl shadow-white/5'}`}
              >
                {task.completed ? 'CLAIMED' : isVerifying ? `${secondsLeft}s` : 'JOIN'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Persistent Refresh Button Section */}
      <div className="mt-12 mb-6 flex flex-col items-center group">
        <button 
          onClick={handleRefresh}
          disabled={!!verifyingTaskId || isRefreshing}
          className="relative w-full py-7 bg-gradient-to-r from-[#111] to-[#0a0a0a] border-2 border-yellow-500/20 rounded-[3rem] overflow-hidden transition-all active:scale-[0.96] disabled:opacity-30 group"
        >
           {/* Inner glow and animation */}
           <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors"></div>
           <div className="absolute -top-[100%] left-0 w-full h-[300%] bg-gradient-to-b from-transparent via-yellow-500/5 to-transparent rotate-45 pointer-events-none group-hover:animate-[spin_4s_linear_infinite]"></div>
           
           <div className={`flex items-center justify-center gap-5 relative z-10 ${isRefreshing ? 'opacity-50' : ''}`}>
              <div className={`text-3xl transition-all duration-700 ${isRefreshing ? 'rotate-[720deg] scale-125' : 'group-hover:rotate-180'}`}>🔄</div>
              <div className="text-left">
                  <span className="block text-[13px] font-black text-white uppercase tracking-[0.35em]">Get New Tasks</span>
                  <span className="block text-[8px] text-yellow-500/60 font-black uppercase tracking-[0.2em] mt-1">Unlimited Continuous Generation</span>
              </div>
           </div>
        </button>
        
        <p className="mt-6 text-[8px] text-gray-700 font-black uppercase tracking-[0.4em] text-center max-w-[200px] leading-relaxed">
          The stars never stop. Refresh to keep earning.
        </p>
      </div>

      <div className="mt-12 p-10 bg-gray-900/5 border-t border-dashed border-gray-800/40 rounded-[4rem] text-center">
        <div className="text-2xl mb-4 opacity-10">🛡️</div>
        <p className="text-[10px] text-gray-700 font-bold leading-loose uppercase tracking-[0.2em]">
          All sponsor interactions are monitored <br/>
          to ensure fair mining distribution.
        </p>
      </div>
    </div>
  );
};

export default TaskView;
