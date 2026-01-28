"use client";

import React, { useEffect, useState } from "react";
import { Star, GitFork, AlertCircle, ExternalLink, Loader2 } from "lucide-react";

import { apiFetch } from "@/lib/api";

interface RepoData {
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    html_url: string;
}

interface GithubRepoCardProps {
    owner: string;
    repo: string;
    title: string;
    description: string;
    language: string;
}

const GithubRepoCard: React.FC<GithubRepoCardProps> = ({ owner, repo, title, description, language }) => {
    const [data, setData] = useState<RepoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await apiFetch(`/api/github/repo?owner=${owner}&repo=${repo}`);
                if (!res.ok) throw new Error("Failed to fetch");
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(`Error fetching repo ${repo}:`, err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [owner, repo]);

    const url = data?.html_url || `https://github.com/${owner}/${repo}`;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
            <div className="absolute top-6 right-6 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors">
                <ExternalLink size={20} />
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">
                {description}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {language}
                </span>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : error ? (
                        <span className="text-xs text-red-400">API Limit</span>
                    ) : (
                        <>
                            <div className="flex items-center gap-1" title="Stars">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span>{data?.stargazers_count}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Forks">
                                <GitFork className="w-4 h-4 text-gray-400" />
                                <span>{data?.forks_count}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Open Issues">
                                <AlertCircle className="w-4 h-4 text-green-500" />
                                <span>{data?.open_issues_count}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </a>
    );
};

export default GithubRepoCard;
