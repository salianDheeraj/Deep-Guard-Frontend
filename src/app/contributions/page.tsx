import React from 'react';
import { Github, ExternalLink, Heart } from 'lucide-react';
import Link from 'next/link';

interface Contributor {
    id: string;
    name: string;
    role: string;
    contribution: string;
    profileUrl?: string;
    imageUrl?: string;
}

const contributors: Contributor[] = [
    // Sample data - Replace with actual contributors
    {
        id: '1',
        name: 'Open Source Dev',
        role: 'Frontend Developer',
        contribution: 'Fixed responsive issues on the dashboard',
        profileUrl: '#',
    },
];

const Repositories = [
    {
        name: 'Frontend Repository',
        description: 'The Next.js user interface and client-side logic.',
        url: 'https://github.com/your-username/deep-guard-frontend', // PLACEHOLDER
        language: 'TypeScript',
    },
    {
        name: 'Backend Repository',
        description: 'Node.js/Express server handling logic and authentication.',
        url: 'https://github.com/your-username/deep-guard-backend', // PLACEHOLDER
        language: 'JavaScript',
    },
    {
        name: 'ML Engine Repository',
        description: 'The core deepfake detection models (FastAPI/Python).',
        url: 'https://github.com/your-username/deep-guard-ml-engine', // PLACEHOLDER
        language: 'Python',
    },
];

export default function ContributionsPage() {
    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 text-gray-800 dark:text-gray-100">

            {/* HEADER */}
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-pink-500 dark:from-cyan-400 dark:to-purple-500">
                    Contributions
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                    Deep-Guard is an open source project. We welcome contributions from the community to help us make the internet a safer place.
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
                        <Link
                            key={repo.name}
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block"
                        >
                            <div className="absolute top-6 right-6 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors">
                                <ExternalLink size={20} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                                {repo.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 h-10">
                                {repo.description}
                            </p>
                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                {repo.language}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CONTRIBUTORS SECTION */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <Heart className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" />
                    <h2 className="text-2xl font-bold">Hall of Fame</h2>
                </div>
                <p className="mb-8 text-gray-600 dark:text-gray-300">
                    A huge thank you to all our accepted contributors!
                </p>

                {contributors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {contributors.map((contributor) => (
                            <div key={contributor.id} className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                                    {contributor.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{contributor.name}</h3>
                                    <p className="text-sm text-blue-600 dark:text-cyan-400 mb-1">{contributor.role}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                        "{contributor.contribution}"
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500">No contributions yet. Be the first!</p>
                    </div>
                )}
            </section>
        </div>
    );
}
