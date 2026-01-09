
import React from 'react';
import { Task } from '../types';

interface TaskViewProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  verifyingTaskId: string | null;
}

const TaskView: React.FC<TaskViewProps> = ({ tasks, onComplete, verifyingTaskId }) => {
  return (
    <div className="py-4">
      <h2 className="text-xl font-extrabold mb-2 text-yellow-400">✅ Daily Tasks</h2>
      <p className="text-gray-400 text-xs mb-6">Complete tasks to earn huge star bonuses!</p>

      <div className="space-y-3">
        {tasks.map((task) => {
          const isVerifying = verifyingTaskId === task.id;
          
          return (
            <div 
              key={task.id}
              className={`bg-gray-900/40 border ${task.completed ? 'border-green-500/30' : isVerifying ? 'border-yellow-500/50 animate-pulse' : 'border-gray-800'} rounded-2xl p-4 flex items-center justify-between transition-all`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${task.completed ? 'bg-green-900/40' : 'bg-gray-800'}`}>
                  {task.completed ? '✔️' : isVerifying ? '⏳' : task.icon}
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${task.completed ? 'text-gray-500' : 'text-white'}`}>{task.title}</h3>
                  <p className="text-xs text-yellow-500 font-bold">+{task.reward.toLocaleString()} Stars</p>
                </div>
              </div>
              
              <button
                onClick={() => onComplete(task.id)}
                disabled={task.completed || verifyingTaskId !== null}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all min-w-[80px]
                  ${task.completed 
                    ? 'bg-transparent text-green-500 border border-green-500/50' 
                    : isVerifying
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-white text-black hover:bg-gray-200 active:scale-95'}`}
              >
                {task.completed ? 'Claimed' : isVerifying ? 'Verifying...' : 'Join'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-10 p-6 bg-gray-900/20 border border-dashed border-gray-800 rounded-3xl">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 text-center">Security Check</h3>
        <p className="text-[10px] text-gray-600 text-center leading-relaxed">
          Rewards are verified by our anti-bot system. Please ensure you stay on the target page for a few seconds to ensure your stars are credited.
        </p>
      </div>
    </div>
  );
};

export default TaskView;
