
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
    setTimeout(() => {
      onRefresh();
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="py-4 relative">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-yellow-400 uppercase tracking-tight flex items-center gap-2">
            <span>✅</span> Daily Tasks
          </h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Earn stars by supporting sponsors</p>
        </div>
      </div>

      {/* Verification Modal Popup */}
      {verifyingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
          <div className="relative bg-gray-900 border border-yellow-500/30 p-8 rounded-[3rem] w-full max-w-xs text-center shadow-2xl">
            <div className="relative w-24 h-24 mx-auto mb-6">
               <svg className="w-full h-full transform -rotate-90">
                  <circle
                    className="text-gray-800"
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
            
            <h3 className="text-xl font-black text-white mb-2">Verifying Visit</h3>
            <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest leading-relaxed">
              Watching Sponsor Ad & <br/> Confirming Participation
            </p>
            
            <div className="mt-6 flex justify-center gap-1">
               <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:200ms]"></div>
               <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:400ms]"></div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tasks.map((task) => {
          const isVerifying = verifyingTaskId === task.id;
          
          return (
            <div 
              key={task.id}
              className={`bg-gray-900/40 border ${task.completed ? 'border-green-500/20 opacity-60' : isVerifying ? 'border-yellow-500/50' : 'border-gray-800'} rounded-2xl p-4 flex items-center justify-between transition-all`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${task.completed ? 'bg-green-900/20' : 'bg-black/60 border border-gray-800'}`}>
                  {task.completed ? '✨' : isVerifying ? '⏳' : task.icon}
                </div>
                <div>
                  <h3 className={`font-black text-xs uppercase tracking-wider ${task.completed ? 'text-gray-600' : 'text-white'}`}>{task.title}</h3>
                  <p className="text-[10px] text-yellow-500 font-black">+{task.reward.toLocaleString()} Stars</p>
                </div>
              </div>
              
              <button
                onClick={() => onComplete(task.id)}
                disabled={task.completed || verifyingTaskId !== null}
                className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all min-w-[90px]
                  ${task.completed 
                    ? 'bg-transparent text-green-500 border border-green-500/30' 
                    : isVerifying
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-white text-black hover:bg-gray-200 active:scale-95 shadow-lg shadow-white/5'}`}
              >
                {task.completed ? 'Claimed' : isVerifying ? `${secondsLeft}s` : 'Join'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Refresh Button Section */}
      <div className="mt-8 flex flex-col items-center">
        <button 
          onClick={handleRefresh}
          disabled={!!verifyingTaskId || isRefreshing}
          className="group relative w-full py-5 bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-3xl overflow-hidden transition-all active:scale-95 disabled:opacity-50"
        >
           <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors"></div>
           <div className={`flex items-center justify-center gap-3 relative z-10 ${isRefreshing ? 'animate-pulse' : ''}`}>
              <span className={`text-xl transition-transform duration-700 ${isRefreshing ? 'rotate-[360deg]' : ''}`}>🔄</span>
              <span className="text-[11px] font-black text-yellow-400 uppercase tracking-[0.25em]">Refresh New 10 Tasks</span>
           </div>
        </button>
        <p className="mt-4 text-[8px] text-gray-700 font-black uppercase tracking-[0.3em] text-center">
          Get a fresh batch of opportunities instantly
        </p>
      </div>

      <div className="mt-10 p-8 bg-gray-900/10 border border-dashed border-gray-800 rounded-[2.5rem] text-center">
        <div className="text-2xl mb-2 opacity-30">🛡️</div>
        <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">Anti-Bot Protocol</h3>
        <p className="text-[9px] text-gray-600 font-bold leading-relaxed uppercase tracking-tighter">
          Verification rewards are auto-credited after <br/>
          5 seconds of active sponsor session.
        </p>
      </div>
    </div>
  );
};

export default TaskView;
