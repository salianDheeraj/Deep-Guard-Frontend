"use client";

import React from "react";
import { ExternalLink, BookMarked } from "lucide-react";

interface GithubRepoCardProps {
    owner: string;
    repo: string;
    title: string;
    description: string;
    language: string;
}

const GithubRepoCard: React.FC<GithubRepoCardProps> = ({ owner, repo, title, description, language }) => {
    const url = `https://github.com/${owner}/${repo}`;

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

            <div className="flex items-center justify-start pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="inline-block px-2 py-0.5 text-[10px] md:text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shrink-0">
                    {language}
                </span>
            </div>
        </a>
    );
};

export default GithubRepoCard;
