"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Video, ArrowRight } from 'lucide-react';

export default function DashboardQuickActions() {
    const router = useRouter();

    return (
        /* Responsive Grid:
           - Stacks (cols-1) with tighter gap (gap-4) on mobile.
           - Side-by-side (cols-2) with wider gap (gap-6) on desktop.
        */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 h-full">

            {/* --- IMAGE ACTION CARD --- */}
            <div
                onClick={() => router.push('/dashboard/new-analysis?type=IMAGE')}
                className="group relative overflow-hidden bg-gradient-to-br from-pink-500 to-pink-600 dark:from-purple-500 dark:to-purple-600 rounded-2xl p-5 md:p-6 text-white shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
                {/* Content Container: Flex col ensures content spaces out evenly */}
                <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px] md:min-h-[160px]">
                    <div className="bg-white/20 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4">
                        <ImageIcon className="text-white w-5 h-5 md:w-6 md:h-6" />
                    </div>

                    <div>
                        <h3 className="text-lg md:text-xl font-bold mb-1">Analyze Image</h3>
                        <p className="text-pink-100 dark:text-purple-100 text-sm mb-4 opacity-90">
                            Detect manipulation in photos.
                        </p>

                        <p className="text-xs md:text-sm font-medium opacity-75 group-hover:opacity-100 transition-opacity flex items-center bg-white/10 w-fit px-2 py-1 rounded-lg backdrop-blur-md">
                            Supports JPG, PNG
                            <ArrowRight className="ml-2 w-3 h-3 md:w-4 md:h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </p>
                    </div>
                </div>

                {/* Decorative Blob */}
                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
            </div>

            {/* --- VIDEO ACTION CARD --- */}
            <div
                onClick={() => router.push('/dashboard/new-analysis?type=VIDEO')}
                className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 dark:from-cyan-500 dark:to-cyan-600 rounded-2xl p-5 md:p-6 text-white shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
                <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px] md:min-h-[160px]">
                    <div className="bg-white/20 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4">
                        <Video className="text-white w-5 h-5 md:w-6 md:h-6" />
                    </div>

                    <div>
                        <h3 className="text-lg md:text-xl font-bold mb-1">Analyze Video</h3>
                        <p className="text-blue-100 dark:text-cyan-100 text-sm mb-4 opacity-90">
                            Scan videos for deepfake content.
                        </p>

                        <p className="text-xs md:text-sm font-medium opacity-75 group-hover:opacity-100 transition-opacity flex items-center bg-white/10 w-fit px-2 py-1 rounded-lg backdrop-blur-md">
                            Supports MP4
                            <ArrowRight className="ml-2 w-3 h-3 md:w-4 md:h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </p>
                    </div>
                </div>

                {/* Decorative Blob */}
                <div className="absolute bottom-[-20%] right-[-5%] w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
            </div>
        </div>
    );
}