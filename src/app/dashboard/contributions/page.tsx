"use client";

import React from 'react';
import { Github, Heart, GitPullRequest } from 'lucide-react';
import GithubRepoCard from '@/components/GithubRepoCard';
import ContributorList from '@/components/ContributorList';
import LegalAwarenessCard from '@/components/LegalAwarenessCard';

const Repositories = [
    {
        owner: 'salianDheeraj',
        repo: 'Deep-Guard-Frontend',
        title: 'Frontend-Deep-Guard',
        description: 'The Next.js user interface and client-side logic.',
        language: 'TypeScript',
    },
    {
        owner: 'salianDheeraj',
        repo: 'Deep-Guard-Backend',
        title: 'Backend Repository',
        description: 'Node.js/Express server handling logic and authentication.',
        language: 'JavaScript',
    },
    {
        owner: 'salianDheeraj',
        repo: 'Deep-Guard-ML-Engine',
        title: 'ML Engine Repository',
        description: 'The core deepfake detection models (FastAPI/Python).',
        language: 'Python',
    },
];

export default function ContributionsPage() {
    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12 text-gray-800 dark:text-gray-100">

            {/* HEADER */}
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-pink-500 dark:from-cyan-400 dark:to-purple-500">
                    Contributions & Community
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                    Deep-Guard is open source. Check out our repositories, meet the contributors, or report issues directly to the team.
                </p>
            </div>

            {/* REPOSITORIES GRID */}
            <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Github className="w-6 h-6" />
                    <span>Project Repositories</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Repositories.map((repo) => (
                        <GithubRepoCard
                            key={repo.repo}
                            {...repo}
                        />
                    ))}
                </div>
            </section>

            {/* CONTRIBUTORS SECTION */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <Heart className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" />
                    <h2 className="text-2xl font-bold">Hall of Fame</h2>
                </div>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                    A huge thank you to all our accepted contributors!
                </p>


                <ContributorList />
            </section>

            {/* PROJECT ORIGINS & TEAM */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Story Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="text-2xl">🚀</span> Project Origins
                    </h2>
                    <div className="space-y-4 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        <p>
                            <strong>Deep-Guard</strong> started in <span className="text-blue-600 dark:text-cyan-400 font-semibold">2025</span> as a college project with a singular mission: to restore trust in digital media.
                        </p>
                        <p>
                            Witnessing the rise of malicious deepfakes targeting individuals, our team of students came together to build an accessible, privacy-first detection tool. What began as a classroom concept has evolved into a fully open-source platform protected by advanced ML models.
                        </p>
                    </div>
                </div>

                {/* Core Team Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="text-2xl">👨‍💻</span> Meet the Core Team
                    </h2>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                D
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100">Dheeraj Salian</h3>
                                <p className="text-xs text-blue-600 dark:text-cyan-400">Lead Developer & ML Engineer</p>
                            </div>
                        </li>
                        <li className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                                T
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100">Anurag Jha</h3>
                                <p className="text-xs text-blue-600 dark:text-cyan-400">Frontend Developer and ui and ux designer</p>
                            </div>
                        </li>
                        <li className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                                P
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100">Parthib Dey(Riyan)</h3>
                                <p className="text-xs text-blue-600 dark:text-cyan-400">Backend Developer & integration of all forms</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>

            {/* LEGAL AWARENESS SECTION */}
            <section className="max-w-3xl">
                <LegalAwarenessCard />
            </section>

        </div>
    );
}
