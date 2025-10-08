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

  return (
    <div 
      className="flex h-screen text-slate-200 font-sans overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at top, #1e293b, #020617)' }}
    >
        <aside className={`absolute top-0 left-0 h-full z-20 bg-slate-900/60 backdrop-blur-lg border-r border-slate-800 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-full sm:w-80 p-4`}>
            <div className="flex flex-col gap-4 whitespace-nowrap mt-12">
                <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800/50 rounded-full pl-12 pr-4 py-3 text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <SearchIcon className="absolute left-4 h-6 w-6 text-slate-400" />
                </div>
                <button className="flex items-center justify-center gap-2 text-lg py-2 px-4 rounded-full self-start hover:bg-slate-700/50 transition-colors border border-slate-700">
                    <EditIcon className="h-6 w-6" />
                    New chat
                </button>
            </div>
        </aside>

        <div className="flex-1 flex flex-col relative">
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute inset-0 bg-black/50 z-10 transition-opacity md:hidden"
                ></div>
            )}
             <header className="absolute top-0 left-0 p-4 z-30">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-full hover:bg-slate-800/80 transition-colors"
                    aria-label="Toggle menu"
                >
                    <MenuIcon className="h-6 w-6 text-slate-300" />
                </button>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 mb-2">
                    Minimalist Insight
                </h1>
                <p className="text-lg sm:text-xl text-slate-400 mb-12">Clarity in a Complex World.</p>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                    <FeatureCard icon={<SearchIcon className="w-10 h-10" />} title="Artifact Detection" />
                    <FeatureCard icon={<VideoIcon className="w-10 h-10" />} title="Deepfake Forensics" />
                    <FeatureCard icon={<EditIcon className="w-10 h-10" />} title="Temporal Analysis" />
                </div>
            </main>
            
            <footer className="p-4 w-full max-w-3xl mx-auto flex-shrink-0">
                <div className="relative flex items-center bg-black/30 backdrop-blur-sm rounded-full p-2 shadow-2xl shadow-black/50 border border-slate-700">
                    <button className="p-2 rounded-full hover:bg-slate-700/50 transition-colors ml-1">
                        <VideoIcon className="h-6 w-6 text-slate-300"/>
                    </button>
                    <input
                        type="text"
                        placeholder="Paste a video URL or ask anything..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 bg-transparent px-4 py-2 text-md text-slate-200 placeholder-slate-400 focus:outline-none"
                    />
                    <button className="p-2 rounded-full hover:bg-slate-700/50 transition-colors mr-1">
                        <MicIcon className="h-6 w-6 text-slate-300"/>
                    </button>
                    <button 
                      onClick={handleVoicePackClick}
                      className={`p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full hover:opacity-90 transition-all duration-300 shadow-lg shadow-indigo-500/30 ${isPlaying ? 'ring-4 ring-purple-400 opacity-100' : ''}`}
                    >
                        <SoundWaveIcon className="h-6 w-6 text-white"/>
                    </button>
                </div>
            </footer>
        </div>
    </div>
  );
}