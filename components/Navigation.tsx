
import React from 'react';
import { Tab } from '../types';

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isAdmin?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, isAdmin }) => {
  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'mine', icon: '⛏️', label: 'Mine' },
    { id: 'boost', icon: '🚀', label: 'Boost' },
    { id: 'tasks', icon: '✅', label: 'Tasks' },
    { id: 'friends', icon: '👥', label: 'Friends' },
    { id: 'wallet', icon: '💼', label: 'Wallet' },
    // Only show admin tab if user is an admin
    ...(isAdmin ? [{ id: 'admin' as Tab, icon: '🛠️', label: 'Admin' }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto tab-bar border-t border-gray-800/50 pb-safe z-50">
      <div className="flex justify-around items-center h-20 px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all
              ${activeTab === item.id 
                ? 'bg-yellow-500/10 text-yellow-500' 
                : 'text-gray-500 hover:text-gray-300'}`}
          >
            <span className={`text-xl mb-1 ${activeTab === item.id ? 'grayscale-0' : 'grayscale opacity-70'}`}>
              {item.icon}
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-tighter">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
