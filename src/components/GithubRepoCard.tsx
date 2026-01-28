"use client";

import React, { useEffect, useState } from "react";
import { Star, GitFork, AlertCircle, ExternalLink, Loader2, BookMarked } from "lucide-react";

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
            className="group relative p-3 md:p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 min-w-0"
        >
            <div className="absolute top-0 right-0 p-3 md:p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500" />
            </div>

            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                <div className="p-1.5 md:p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shrink-0">
                    <BookMarked className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h3 className="font-bold text-sm md:text-lg text-gray-800 dark:text-gray-100 truncate w-full pr-6">
                    {title}
                </h3>
            </div>

            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[32px] md:min-h-[40px]">
                {description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="inline-block px-2 py-0.5 text-[10px] md:text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shrink-0">
                    {language}
                </span>

                <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-sm text-gray-600 dark:text-gray-400 font-medium ml-auto flex-wrap justify-end">
                    {loading ? (
                        <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-gray-400" />
                    ) : error ? (
                        <span className="text-[10px] text-red-400">API Limit</span>
                    ) : (
                        <>
                            <div className="flex items-center gap-1" title="Stars">
                                <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                                <span>{data?.stargazers_count}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Forks">
                                <GitFork className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                                <span>{data?.forks_count}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Open Issues">
                                <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
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
