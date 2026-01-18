"use client";

import React, { useState } from 'react';
import { ShieldAlert, HeartHandshake, HelpCircle, ChevronRight, ChevronLeft, Flag } from 'lucide-react';

type GuideSection = 'legal' | 'safety' | 'results';

export default function SidebarGuide() {
    const [activeSection, setActiveSection] = useState<GuideSection>('legal');

    // Simple carousel-like navigation
    const sections: GuideSection[] = ['legal', 'safety', 'results'];

    const nextSection = () => {
        const idx = sections.indexOf(activeSection);
        setActiveSection(sections[(idx + 1) % sections.length]);
    };

    const prevSection = () => {
        const idx = sections.indexOf(activeSection);
        setActiveSection(sections[(idx - 1 + sections.length) % sections.length]);
    };

    return (
        <div className="mx-4 mt-auto mb-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-colors">
            {/* Header controls */}
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                <button
                    onClick={prevSection}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>

                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                    {activeSection === 'legal' && "Legal Awareness"}
                    {activeSection === 'safety' && "Safety Tips"}
                    {activeSection === 'results' && "Understanding Results"}
                </span>

                <button
                    onClick={nextSection}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Content Area - Min height to prevent jumping */}
            <div className="min-h-[180px]">
                {activeSection === 'legal' && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 text-red-500 mb-1">
                            <ShieldAlert size={16} />
                            <span className="text-xs font-semibold">Know Your Rights</span>
                        </div>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-4">
                            <li>Deepfakes can constitute impersonation or fraud.</li>
                            <li>Victims have the right to file complaints.</li>
                            <li>Reporting early increases chances of action.</li>
                        </ul>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 italic mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                            *This tool does not provide legal advice.
                        </p>
                    </div>
                )}

                {activeSection === 'safety' && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 text-emerald-500 mb-1">
                            <HeartHandshake size={16} />
                            <span className="text-xs font-semibold">Stay Safe</span>
                        </div>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-4">
                            <li>Do not share suspected deepfakes further.</li>
                            <li>Preserve original files and links.</li>
                            <li>Avoid confronting the uploader directly.</li>
                            <li>Enable privacy controls on social platforms.</li>
                        </ul>
                    </div>
                )}

                {activeSection === 'results' && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 text-blue-500 mb-1">
                            <HelpCircle size={16} />
                            <span className="text-xs font-semibold">Interpreting Scores</span>
                        </div>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-4">
                            <li><span className="font-semibold text-gray-700 dark:text-gray-300">High Confidence:</span> AI is very certain.</li>
                            <li><span className="font-semibold text-gray-700 dark:text-gray-300">Low Confidence ≠ Fake:</span> It means uncertainty.</li>
                            <li>AI results are probabilistic, not absolute proof.</li>
                            <li>Human review is always recommended.</li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-1 mt-2">
                {sections.map((section) => (
                    <div
                        key={section}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${activeSection === section
                                ? 'bg-blue-600 dark:bg-cyan-400'
                                : 'bg-gray-300 dark:bg-slate-700'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
