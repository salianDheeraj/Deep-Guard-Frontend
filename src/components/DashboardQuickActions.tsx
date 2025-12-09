"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Video, ArrowRight } from 'lucide-react';

export default function DashboardQuickActions() {
    const router = useRouter();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* IMAGE ACTION */}
            <div
                onClick={() => router.push('/dashboard/new-analysis?type=IMAGE')}
                className="group relative overflow-hidden bg-gradient-to-br from-pink-500 to-pink-600 dark:from-purple-500 dark:to-purple-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl"
            >
                <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
                    <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4">
                        <ImageIcon className="text-white w-6 h-6" />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-1">Analyze Image</h3>
                        <p className="text-pink-100 dark:text-purple-100 text-sm mb-4 opacity-90">Detect manipulation in photos.</p>

                        <p className="text-sm font-medium opacity-75 group-hover:opacity-100 transition-opacity flex items-center">
                            Supports JPG, PNG <ArrowRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </p>
                    </div>
                </div>

                {/* Decorative Circle */}
                <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
            </div>

            {/* VIDEO ACTION */}
            <div
                onClick={() => router.push('/dashboard/new-analysis?type=VIDEO')}
                className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 dark:from-cyan-500 dark:to-cyan-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl"
            >
                <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
                    <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4">
                        <Video className="text-white w-6 h-6" />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-1">Analyze Video</h3>
                        <p className="text-blue-100 dark:text-cyan-100 text-sm mb-4 opacity-90">Scan videos for deepfake content.</p>

                        <p className="text-sm font-medium opacity-75 group-hover:opacity-100 transition-opacity flex items-center">
                            Supports MP4 <ArrowRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </p>
                    </div>
                </div>

                {/* Decorative Circle */}
                <div className="absolute bottom-[-20%] right-[-5%] w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
            </div>
        </div>
    );
}
