
import React from 'react';
import { Boost } from '../types';

interface BoostViewProps {
  balance: number;
  boosts: Boost[];
  onUpgrade: (id: string) => void;
}

const BoostView: React.FC<BoostViewProps> = ({ balance, boosts, onUpgrade }) => {
  return (
    <div className="py-4">
      <h2 className="text-xl font-extrabold mb-6 text-yellow-400 flex items-center gap-2">
        🚀 Upgrades & Boosts
      </h2>
      
      <div className="space-y-4">
        {boosts.map((boost) => {
          const cost = Math.floor(boost.baseCost * Math.pow(boost.multiplier, boost.level));
          const canAfford = balance >= cost;

          return (
            <div 
              key={boost.id}
              className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-2xl">
                  {boost.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white">{boost.name}</h3>
                  <p className="text-xs text-gray-400">{boost.description}</p>
                  <p className="text-xs font-medium text-yellow-500 mt-1">Lvl {boost.level}</p>
                </div>
              </div>
              
              <button
                onClick={() => onUpgrade(boost.id)}
                disabled={!canAfford}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                  ${canAfford 
                    ? 'bg-yellow-500 text-black hover:bg-yellow-400 active:scale-95' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
              >
                {cost.toLocaleString()} ✨
              </button>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 p-6 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-3xl border border-indigo-500/20">
        <h4 className="font-bold text-indigo-300 mb-2">🔥 Special Boosts</h4>
        <p className="text-xs text-indigo-200/60 leading-relaxed">
          Turbo Charge spawns randomly in the Mining area. Keep an eye out for glowing icons to get 10x multiplier for 20 seconds!
        </p>
      </div>
    </div>
  );
};

export default BoostView;
