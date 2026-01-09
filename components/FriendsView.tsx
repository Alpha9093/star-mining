
import React, { useState } from 'react';
import { getUserId } from '../firebase';

interface FriendsViewProps {
  balance: number;
}

const FriendsView: React.FC<FriendsViewProps> = ({ balance }) => {
  const [showToast, setShowToast] = useState(false);
  // Using the provided bot username and appending the user's unique ID for referral tracking
  const shareLink = `https://t.me/Starminingbeast_bot?start=${getUserId()}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }).catch(() => {
      alert("Failed to copy link. Please try again.");
    });
  };

  const handleInvite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join StarMining!',
          text: 'Tap stars and earn rewards with me on StarMining!',
          url: shareLink,
        });
      } catch (err) {
        // Fallback to clipboard if share fails (e.g. user cancelled or platform restriction)
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="py-4 text-center relative">
      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full font-bold shadow-lg z-[100] animate-bounce">
          Link Copied! 📋
        </div>
      )}

      <div className="mb-8">
        <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-500/30">
          <span className="text-5xl">👥</span>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Invite Friends</h2>
        <p className="text-gray-400 text-sm px-6">
          You and your friend will both receive <span className="text-yellow-400 font-bold">200 Stars</span> as a bonus!
        </p>
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 mb-8">
        <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase">Your Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-black/40 rounded-2xl border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Invited</p>
            <p className="text-xl font-black text-white">0</p>
          </div>
          <div className="p-4 bg-black/40 rounded-2xl border border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Earned</p>
            <p className="text-xl font-black text-yellow-500">0 ✨</p>
          </div>
        </div>
      </div>

      <button 
        onClick={handleInvite}
        className="w-full py-4 bg-yellow-500 text-black font-black text-lg rounded-2xl shadow-[0_4px_20px_rgba(234,179,8,0.4)] active:scale-95 transition-all"
      >
        Send Invite Link
      </button>
      
      <p className="mt-6 text-xs text-gray-500 font-medium">
        Rewards are distributed instantly after your friend reaches Level 2.
      </p>
    </div>
  );
};

export default FriendsView;
