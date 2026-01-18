"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { debug } from '@/lib/logger';
import styles from "@/styles/Login.module.css";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { useLoginAnimation } from "@/hooks/useLoginAnimation";

export default function TryWithoutAccountPage() {
    const router = useRouter();
    const scope = useRef<HTMLDivElement>(null);
    useLoginAnimation(scope);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleJoinTrial = async () => {
        try {
            setIsLoading(true);
            const res = await apiFetch("/api/trial/join", {
                method: "POST",
            });

            if (res.ok) {
                debug("✅ Trial started");
                router.push("/dashboard");
            } else {
                const err = await res.json();
                setError(err.message || "Trial join failed");
            }
        } catch (e: any) {
            setError("Failed to join trial");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div ref={scope} className={styles.container}>
            <div className={styles.themeToggle}>
                <ThemeToggleButton />
            </div>

            <header className={`${styles.header} login-title-group flex flex-col items-center gap-2`}>
                <div className={`${styles.logo} login-logo`}>
                    {/* LOGO: Solid Blue (Light) / Solid Cyan (Dark) */}
                    <Shield className={`${styles.logoIcon} !text-blue-600 dark:!text-cyan-400 w-12 h-12 md:w-16 md:h-16 transition-colors duration-300`} />
                </div>
                <h1 className={`${styles.title} !bg-clip-text !text-transparent !bg-gradient-to-r !from-blue-600 !to-pink-500 dark:!from-cyan-400 dark:!to-purple-500 transition-all duration-300 text-2xl md:text-3xl font-bold`}>
                    Deepfake Detector
                </h1>
                <p className={`${styles.subtitle} mt-2 text-sm md:text-base`}>
                    Try without an account
                </p>
            </header>

            <div className={`${styles.card} login-card`}>
                {error && (
                    <div className={styles.error}>{error}</div>
                )}

                <div className="text-center mb-8 text-gray-600 dark:text-gray-300">
                    <p>Access our detection tools immediately with a temporary guest account.</p>
                </div>

                <button
                    type="button"
                    onClick={handleJoinTrial}
                    // TRIAL BUTTON: Gradient Blue+Pink (Light) / Cyan+Purple (Dark)
                    className={`${styles.submitButton} login-button !border-0 !text-white font-bold !bg-gradient-to-r !from-blue-600 !to-pink-500 hover:!from-blue-700 hover:!to-pink-600 dark:!from-cyan-400 dark:!to-purple-600 dark:hover:!from-cyan-500 dark:hover:!to-purple-700 transition-all duration-300 w-full py-3`}
                    disabled={isLoading}
                >
                    {isLoading ? "Joining..." : "Continue as Guest"}
                </button>

                <div className="mt-6 text-center">
                    <button onClick={() => router.push('/login')} className="text-sm text-gray-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
