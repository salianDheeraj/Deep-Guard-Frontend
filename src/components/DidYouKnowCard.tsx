"use client";

import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';

const FACTS = [
    "Deepfakes often struggle to replicate natural blinking patterns.",
    "Inconsistent lighting on the face vs. background is a common deepfake giveaway.",
    "AI-generated audio might lack natural breathing sounds or pauses.",
    "Lip-syncing errors are one of the easiest ways to spot a manipulated video.",
    "High-quality deepfakes require significant computational power to generate.",
    "Digital watermarking is an emerging method to protect authentic content.",
    "The term 'Deepfake' comes from 'Deep Learning' and 'Fake'.",
];

export default function DidYouKnowCard() {
    const [fact, setFact] = useState("");

    useEffect(() => {
        setFact(FACTS[Math.floor(Math.random() * FACTS.length)]);
    }, []);

    const refreshFact = (e: React.MouseEvent) => {
        e.stopPropagation();
        let newFact;
        do {
            newFact = FACTS[Math.floor(Math.random() * FACTS.length)];
        } while (newFact === fact);
        setFact(newFact);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border border-indigo-100 dark:border-slate-700 rounded-2xl p-6 h-full flex flex-col justify-center relative group">
            <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm uppercase tracking-wide">Did You Know?</h4>
            </div>

            <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic">
                "{fact}"
            </p>

            <button
                onClick={refreshFact}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700 text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
                title="New Fact"
            >
                <RefreshCw className="w-4 h-4" />
            </button>
        </div>
    );
}
