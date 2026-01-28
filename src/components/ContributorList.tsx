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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await apiFetch(`/api/github/contributors?owner=${owner}&repo=${repo}`);
                if (!res.ok) throw new Error("Failed to fetch");
                const json = await res.json();
                setContributors(json);
            } catch (err) {
                console.error(`Error fetching contributors for ${repo}:`, err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [owner, repo]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {contributors.map((user) => (
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
    );
};

export default ContributorList;
