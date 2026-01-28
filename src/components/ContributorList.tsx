"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Contributor {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
    contributions: number;
}

interface ContributorListProps {
    owner: string;
    repo: string;
    title?: string;
}

const ContributorList: React.FC<ContributorListProps> = ({ owner, repo }) => {
    const [contributors, setContributors] = useState<Contributor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch aggregated contributors (backend handles repo list)
                const res = await apiFetch(`/api/github/contributors?owner=${owner}`);
                if (!res.ok) throw new Error("Failed to fetch");
                const json = await res.json();
                setContributors(json);
            } catch (err) {
                console.error(`Error fetching contributors:`, err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [owner, repo]);

    // Reset page when repo changes
    useEffect(() => setCurrentPage(1), [owner, repo]);

    const totalPages = Math.ceil(contributors.length / ITEMS_PER_PAGE);
    const displayedContributors = contributors.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (error || contributors.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>Unable to load contributors list at this time.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayedContributors.map((user) => (
                    <a
                        key={user.id}
                        href={user.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all duration-200 min-w-0"
                    >
                        <img
                            src={user.avatar_url}
                            alt={user.login}
                            className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700"
                        />
                        <div className="overflow-hidden">
                            <h4 className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">{user.login}</h4>
                            <p className="text-xs text-blue-600 dark:text-cyan-400 font-medium">
                                {user.contributions} contribution{user.contributions !== 1 && 's'}
                            </p>
                        </div>
                    </a>
                ))}
            </div>

            {/* Pagination Controls */}
            {contributors.length > 0 && (
                <div className="flex justify-center items-center gap-4">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-transparent"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Page {currentPage} of {Math.max(1, totalPages)}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-transparent"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ContributorList;
