"use client";

import React from "react";
import { Scale, ExternalLink, ShieldAlert, LifeBuoy } from "lucide-react";

const LegalAwarenessCard = () => {
    return (
        <div className="bg-white dark:bg-gray-800 p-5 md:p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Scale className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold">Know Your Rights</h2>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Deepfakes can constitute impersonation or fraud.</p>
                </div>
            </div>

            <div className="space-y-4 md:space-y-6">
                {/* SECTION 1: IT ACT */}
                <div className="p-3 md:p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                    <h3 className="flex items-center gap-2 font-semibold text-base md:text-lg mb-2 text-gray-800 dark:text-gray-200">
                        <ShieldAlert className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                        Is Deepfake Impersonation Illegal?
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed break-words">
                        Yes. Under <strong>Section 66D of the IT Act, 2000</strong> and <strong>BNS 2023</strong>, creating a deepfake to cheat or impersonate someone is a punishable offense. Offenders can face imprisonment up to 3 years and fines.
                    </p>
                </div>

                {/* SECTION 2: FILING COMPLAINT */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <a
                        href="https://cybercrime.gov.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 group flex flex-col p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer min-w-0"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm md:text-base text-gray-800 dark:text-gray-200">File a Complaint</h4>
                            <ExternalLink className="w-3 h-3 md:w-4 md:h-4 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Report cybercrimes anonymously at <strong>cybercrime.gov.in</strong> (National Cyber Crime Reporting Portal).
                        </p>
                    </a>

                    {/* SECTION 3: HELPLINE */}
                    <div className="flex-1 flex flex-col p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 min-w-0">
                        <div className="flex items-center gap-2 mb-2 text-gray-800 dark:text-gray-200">
                            <LifeBuoy className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                            <h4 className="font-semibold text-sm md:text-base">Victim Support</h4>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Immediate assistance for cyber fraud or harassment.
                        </p>
                        <div className="mt-auto">
                            <span className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-wider">1930</span>
                            <span className="text-[10px] md:text-xs text-gray-400 ml-2">(National Helpline)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalAwarenessCard;
