"use client";

import React, { useState, FormEvent } from "react";
import { Send, Bug, Loader2, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

const BugReportForm = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        description: "",
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await apiFetch("/api/support/bug-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error("Failed to send report");
            }

            setSuccess(true);
            setFormData({ name: "", email: "", description: "" });
        } catch (err) {
            console.error(err);
            setError("Failed to send bug report. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    <Bug className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Report a Bug</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Found an issue? Let us know directly.</p>
                </div>
            </div>

            {success ? (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-6 rounded-lg text-center flex flex-col items-center gap-3 animate-in fade-in duration-300">
                    <CheckCircle2 className="w-12 h-12" />
                    <h3 className="font-bold text-lg">Report Sent Successfully!</h3>
                    <p className="text-sm opacity-90">Thank you for helping us improve Deep-Guard.</p>
                    <button
                        onClick={() => setSuccess(false)}
                        className="mt-2 text-sm font-semibold underline hover:text-green-800 dark:hover:text-green-200"
                    >
                        Send another report
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Name (Optional)</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Email (Optional)</label>
                            <input
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Issue Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            required
                            placeholder="Describe the bug, steps to reproduce, or any other details..."
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 text-white font-bold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Send Report
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
};

export default BugReportForm;
