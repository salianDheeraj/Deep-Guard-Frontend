'use client';

import React, { useState, useRef, useEffect } from 'react';

// --- SVG Icon Components ---
const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const VideoIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m22 8-6 4 6 4V8Z" />
        <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
);

const MicIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
  </svg>
);

const SoundWaveIcon = ({ className }: { className?: string }) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path d="M3 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const MenuIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

// --- Feature Card Component ---
const FeatureCard = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="bg-slate-900/40 backdrop-blur-lg border border-indigo-500/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center w-full sm:w-52 h-48 hover:bg-slate-800/60 hover:border-indigo-400 transition-all duration-300 cursor-pointer shadow-lg shadow-indigo-500/5 hover:shadow-indigo-400/20">
        <div className="text-indigo-300">{icon}</div>
        <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
    </div>
);

// --- Main App Component ---
export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const audioContext = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);

  const handleVoicePackClick = () => {
    if (!isPlaying) {
      try {
        if (!audioContext.current) {
          audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const actx = audioContext.current;
        if (oscillator.current) oscillator.current.stop();
        oscillator.current = actx.createOscillator();
        oscillator.current.type = 'sine';
        oscillator.current.frequency.setValueAtTime(440, actx.currentTime);
        const gainNode = actx.createGain();
        gainNode.gain.setValueAtTime(0.5, actx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.5);
        oscillator.current.connect(gainNode);
        gainNode.connect(actx.destination);
        oscillator.current.start();
        oscillator.current.stop(actx.currentTime + 0.5);
        setIsPlaying(true);
        setTimeout(() => setIsPlaying(false), 500);
      } catch (error) {
        console.error('Audio context not supported:', error);
      }
    } 
  };
  
  useEffect(() => {
    return () => {
      audioContext.current?.close();
    };
  }, []);

  // Rest of your component remains the same...
  return (
    <div 
      className="flex h-screen text-slate-200 font-sans overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at top, #1e293b, #020617)' }}
    >
        {/* Your existing JSX remains unchanged */}
        {/* ... */}
    </div>
  );
}
