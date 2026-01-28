"use client";

import React from "react";

// Static list of core team members
const teamMembers = [
    {
        login: "salianDheeraj",
        avatar_url: "https://github.com/salianDheeraj.png",
        html_url: "https://github.com/salianDheeraj"
    },
    {
        login: "Anurag0018",
        avatar_url: "https://github.com/Anurag0018.png",
        html_url: "https://github.com/Anurag0018"
    },
    {
        login: "Riyan-ai-code",
        avatar_url: "https://github.com/Riyan-ai-code.png",
        html_url: "https://github.com/Riyan-ai-code"
    }
];

export default function ContributorList() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
            {teamMembers.map((member) => (
                <a
                    key={member.login}
                    href={member.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all border border-gray-200 dark:border-gray-700 min-w-0 group"
                >
                    <img
                        src={member.avatar_url}
                        alt={member.login}
                        className="w-20 h-20 rounded-full mb-3 ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-red-500 transition-all"
                    />
                    <h3 className="font-semibold text-gray-900 dark:text-white text-center truncate w-full group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        @{member.login}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        View Profile →
                    </p>
                </a>
            ))}
        </div>
    );
}
