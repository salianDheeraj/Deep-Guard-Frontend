"use client";

import React from 'react';
import { Github, Heart, GitPullRequest } from 'lucide-react';
import GithubRepoCard from '@/components/GithubRepoCard';
import ContributorList from '@/components/ContributorList';
import BugReportForm from '@/components/BugReportForm';


const GITHUB_OWNER = "Riyan-ai-code";

const Repositories = [
    {
        owner: GITHUB_OWNER,
        repo: 'Deep-Guard-Frontend',
        title: 'Frontend Repository',
        description: 'The Next.js user interface and client-side logic.',
        language: 'TypeScript',
    },
    {
        owner: GITHUB_OWNER,
        repo: 'Deep-Guard-Backend',
        title: 'Backend Repository',
        description: 'Node.js/Express server handling logic and authentication.',
        language: 'JavaScript',
    },
    {
        owner: GITHUB_OWNER,
        repo: 'Deep-Guard-ML-Engine',
        title: 'ML Engine Repository',
        description: 'The core deepfake detection models (FastAPI/Python).',
        language: 'Python',
    },
];

export default function ContributionsPage() {
    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12 text-gray-800 dark:text-gray-100">

            {/* HEADER */}
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-pink-500 dark:from-cyan-400 dark:to-purple-500">
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

                {/* 
                    Since we likely don't have a real comprehensive list for "all repos" combined easily via one API call without logic,
                    we can display contributors for the main frontend repo or repeat the list for critical repos. 
                    For now, let's show contributors for the Frontend repo as the primary example.
                */}
                <ContributorList owner={GITHUB_OWNER} repo="Deep-Guard-Frontend" />
            </section>

            {/* BUG REPORT SECTION */}
            <section className="max-w-3xl">
                <BugReportForm />
            </section>

        </div>
    );
}
